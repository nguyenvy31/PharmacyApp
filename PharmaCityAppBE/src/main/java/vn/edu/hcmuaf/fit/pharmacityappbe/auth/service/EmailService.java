package vn.edu.hcmuaf.fit.pharmacityappbe.auth.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.entity.Order;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.entity.OrderItem;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Mã OTP xác thực tài khoản");
        message.setText(
                "Xin chào!\n\n" +
                        "Mã OTP của bạn là: " + otpCode + "\n" +
                        "Mã có hiệu lực trong 5 phút.\n\n" +
                        "Trân trọng."
        );

        mailSender.send(message);
    }

    public void sendPaymentSuccessEmail(Order order, String paymentMethod) {
        try {
            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

            // Format đơn hàng
            StringBuilder itemsText = new StringBuilder();
            List<OrderItem> items = order.getItems();
            for (OrderItem item : items) {
                itemsText.append(String.format(
                        "  • %s x %d = %s\n",
                        item.getMedicine().getName(),
                        item.getQuantity(),
                        currencyFormat.format(item.getUnitPrice() * item.getQuantity())
                ));
            }

            String emailContent = String.format(
                    "Xin chào %s!\n\n" +
                            "Cảm ơn bạn đã mua hàng tại PharmaCity. Đơn hàng #%d của bạn đã được thanh toán thành công.\n\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "📋 CHI TIẾT ĐƠN HÀNG\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "Mã đơn hàng: #%d\n" +
                            "Ngày đặt: %s\n" +
                            "Phương thức thanh toán: %s\n\n" +
                            "🛍️ SẢN PHẨM:\n%s\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "💰 TẠM TÍNH: %s\n" +
                            "🚚 PHÍ VẬN CHUYỂN: %s\n" +
                            "🎁 GIẢM GIÁ: %s\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "💵 TỔNG CỘNG: %s\n\n" +
                            "📦 THÔNG TIN GIAO HÀNG:\n" +
                            "  Người nhận: %s\n" +
                            "  Số điện thoại: %s\n" +
                            "  Địa chỉ: %s\n" +
                            "  Ghi chú: %s\n\n" +
                            "Trạng thái: Đã thanh toán - Đang xử lý\n\n" +
                            "Chúng tôi sẽ giao hàng trong thời gian sớm nhất.\n\n" +
                            "Trân trọng,\n" +
                            "PharmaCity Pharmacy",

                    order.getReceiverName(),
                    order.getId(),
                    order.getId(),
                    order.getCreatedAt() != null ? order.getCreatedAt().toString() : "Chưa cập nhật",
                    paymentMethod.equals("MOMO") ? "Ví Momo" : "Thẻ tín dụng/ghi nợ (VNPay)",
                    itemsText.toString(),
                    currencyFormat.format(order.getTotalAmount() + order.getDiscountAmount() - order.getShippingFee()),
                    currencyFormat.format(order.getShippingFee()),
                    currencyFormat.format(order.getDiscountAmount()),
                    currencyFormat.format(order.getTotalAmount()),
                    order.getReceiverName(),
                    order.getReceiverPhone(),
                    order.getShippingAddress(),
                    order.getNote() != null && !order.getNote().isEmpty() ? order.getNote() : "Không có ghi chú"
            );

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(order.getUser().getEmail());
            message.setSubject("Xác nhận thanh toán đơn hàng #" + order.getId() + " - PharmaCity");
            message.setText(emailContent);

            mailSender.send(message);
            System.out.println("✅ Email payment confirmation sent to: " + order.getUser().getEmail());

        } catch (Exception e) {
            System.err.println("❌ Failed to send payment confirmation email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ✅ Method gửi email thông báo hủy đơn hàng (optional)
    public void sendOrderCancelledEmail(Order order) {
        try {
            String emailContent = String.format(
                    "Xin chào %s!\n\n" +
                            "Đơn hàng #%d của bạn đã bị hủy.\n\n" +
                            "Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.\n\n" +
                            "Trân trọng,\n" +
                            "PharmaCity Pharmacy",

                    order.getReceiverName(),
                    order.getId()
            );

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(order.getUser().getEmail());
            message.setSubject("Thông báo hủy đơn hàng #" + order.getId() + " - PharmaCity");
            message.setText(emailContent);

            mailSender.send(message);
            System.out.println("✅ Email cancellation sent to: " + order.getUser().getEmail());

        } catch (Exception e) {
            System.err.println("❌ Failed to send cancellation email: " + e.getMessage());
        }
    }
}
