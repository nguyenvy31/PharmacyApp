package vn.edu.hcmuaf.fit.pharmacityappbe.order.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.service.EmailService;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.entity.Order;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.repository.OrderRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.service.MomoService;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment/momo")
@CrossOrigin(origins = "*")
public class MomoController {

    private final OrderRepository orderRepository;
    private final MomoService momoService;
    private final EmailService emailService; // ✅ Inject EmailService

    public MomoController(OrderRepository orderRepository, MomoService momoService, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.momoService = momoService;
        this.emailService = emailService;
    }

    @PostMapping("/create-momo")
    public Map<String, String> createMomoPayment(@RequestBody Map<String, Object> payload) {
        try {
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            Long amount = Long.valueOf(payload.get("amount").toString());

            Order order = orderRepository.findById(orderId.intValue())
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            String momoOrderId = orderId + "_" + System.currentTimeMillis();
            String response = momoService.createPayment(momoOrderId, amount);
            JSONObject json = new JSONObject(response);

            if (json.has("payUrl")) {
                order.setPaymentMethod("MOMO");
                order.setPaymentStatus("PENDING");
                orderRepository.save(order);

                return Map.of(
                        "paymentUrl", json.getString("payUrl"),
                        "orderId", order.getId().toString()
                );
            } else {
                order.setPaymentStatus("FAILED");
                order.setStatus("Thanh toán thất bại");
                orderRepository.save(order);

                return Map.of("error", json.has("error") ? json.getString("error") : response);
            }

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", e.getMessage());
        }
    }

    @GetMapping("/momo-return")
    public void momoReturn(
            @RequestParam String orderId,
            @RequestParam String resultCode,
            HttpServletResponse response
    ) throws IOException {
        try {
            System.out.println("=== MOMO RETURN CALLBACK ===");
            System.out.println("OrderId: " + orderId);
            System.out.println("ResultCode: " + resultCode);

            String originalOrderId = orderId.split("_")[0];
            Order order = orderRepository.findById(Integer.parseInt(originalOrderId))
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            if ("0".equals(resultCode)) {
                order.setPaymentStatus("PAID");
                order.setStatus("PENDING");
                System.out.println("✅ Updated to PAID");

                // ✅ Gửi email xác nhận thanh toán
                emailService.sendPaymentSuccessEmail(order, "MOMO");

            } else {
                order.setPaymentStatus("FAILED");
                order.setStatus("Thanh toán thất bại");
                System.out.println("❌ Updated to FAILED");
            }

            orderRepository.save(order);

            String redirectUrl = String.format(
                    "myapp://payment-result?orderId=%s&resultCode=%s&paymentMethod=MOMO",
                    originalOrderId, resultCode
            );

            System.out.println("Redirecting to: " + redirectUrl);
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("myapp://payment-result?error=" + e.getMessage());
        }
    }

    @PostMapping("/momo-ipn")
    public ResponseEntity<?> momoIpn(@RequestBody Map<String, Object> body) {
        try {
            System.out.println("=== MOMO IPN CALLBACK ===");
            System.out.println("IPN Body: " + body);

            String orderId = body.get("orderId").toString();
            String resultCode = body.get("resultCode").toString();
            String transactionId = body.get("transId") != null ? body.get("transId").toString() : "";

            String originalOrderId = orderId.split("_")[0];
            Order order = orderRepository.findById(Integer.parseInt(originalOrderId))
                    .orElseThrow();

            if ("0".equals(resultCode)) {
                order.setPaymentStatus("PAID");
                order.setStatus("PENDING");
                System.out.println("IPN - Updated to PAID");

                // ✅ Gửi email xác nhận thanh toán (nếu chưa gửi ở momo-return)
                emailService.sendPaymentSuccessEmail(order, "MOMO");

            } else {
                order.setPaymentStatus("FAILED");
                order.setStatus("Thanh toán thất bại");
                System.out.println("IPN - Updated to FAILED");
            }

            orderRepository.save(order);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            System.err.println("IPN Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}