package vn.edu.hcmuaf.fit.pharmacityappbe.order.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.service.EmailService;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.config.ConfigVNPay;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.entity.Order;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.repository.OrderRepository;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/v1/payment/vnpay")
public class VNPayController {
    private final OrderRepository orderRepository;
    private final EmailService emailService; // ✅ Inject EmailService

    public VNPayController(OrderRepository orderRepository, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.emailService = emailService;
    }

    @GetMapping("/create")
    public ResponseEntity<?> createPayment(HttpServletRequest req,
                                           @RequestParam("orderId") int orderId) throws Exception {

        System.out.println("=== CREATE VNPAY PAYMENT ===");
        System.out.println("OrderId: " + orderId);

        String vnp_TxnRef = String.valueOf(orderId);
        String vnp_IpAddr = req.getRemoteAddr();

        Map<String, String> vnp_Params = new HashMap<>();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        long amount = order.getTotalAmount();

        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", ConfigVNPay.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", ConfigVNPay.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");

        String vnp_CreateDate = formatter.format(cld.getTime());
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = vnp_Params.get(fieldName);

            if (fieldValue != null && !fieldValue.isEmpty()) {
                String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII);
                hashData.append(fieldName).append("=").append(encodedValue);
                query.append(fieldName).append("=").append(encodedValue);

                if (i < fieldNames.size() - 1) {
                    hashData.append("&");
                    query.append("&");
                }
            }
        }

        String vnp_SecureHash = ConfigVNPay.hmacSHA512(ConfigVNPay.secretKey, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);

        String paymentUrl = ConfigVNPay.vnp_PayUrl + "?" + query.toString();

        Map<String, String> result = new HashMap<>();
        result.put("paymentUrl", paymentUrl);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/return")
    public void paymentReturn(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException {
        try {
            System.out.println("=== VNPAY RETURN CALLBACK ===");
            System.out.println("All params: " + params);

            String responseCode = params.get("vnp_ResponseCode");
            String orderId = params.get("vnp_TxnRef");

            System.out.println("OrderId: " + orderId);
            System.out.println("ResponseCode: " + responseCode);

            Optional<Order> optionalOrder = orderRepository.findById(Integer.valueOf(orderId));

            if (optionalOrder.isEmpty()) {
                System.out.println("Order not found: " + orderId);
                response.sendRedirect("myapp://payment-result?error=order_not_found");
                return;
            }

            Order order = optionalOrder.get();
            System.out.println("Before update - PaymentStatus: " + order.getPaymentStatus());

            if ("00".equals(responseCode)) {
                order.setPaymentStatus("PAID");
                order.setStatus("PENDING");
                System.out.println("✅ Updated to PAID");

                // ✅ Gửi email xác nhận thanh toán
                emailService.sendPaymentSuccessEmail(order, "VNPAY");

            } else {
                order.setPaymentStatus("FAILED");
                order.setStatus("PAYMENT_FAILED");
                System.out.println("❌ Updated to FAILED");
            }

            orderRepository.save(order);
            System.out.println("After update - PaymentStatus: " + order.getPaymentStatus());

            String redirectUrl = String.format(
                    "myapp://payment-result?orderId=%s&resultCode=%s&paymentMethod=CARD",
                    orderId, responseCode
            );

            System.out.println("Redirecting to: " + redirectUrl);
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            System.err.println("VNPay return error: " + e.getMessage());
            e.printStackTrace();
            response.sendRedirect("myapp://payment-result?error=" + e.getMessage());
        }
    }
}