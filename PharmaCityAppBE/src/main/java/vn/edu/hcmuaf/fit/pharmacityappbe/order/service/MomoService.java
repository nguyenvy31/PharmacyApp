package vn.edu.hcmuaf.fit.pharmacityappbe.order.service;

import org.json.JSONObject;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.config.ConfigMomo;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class MomoService {

    public String createPayment(String momoOrderId, Long amount) {
        try {
            String orderInfo = "Thanh toán đơn hàng " + momoOrderId;
            String extraData = ""; // luôn điền trống nếu không dùng

            // ======= Raw signature chuẩn =======
            String rawSignature = "accessKey=" + ConfigMomo.ACCESS_KEY +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + ConfigMomo.IPN_URL +
                    "&orderId=" + momoOrderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + ConfigMomo.PARTNER_CODE +
                    "&redirectUrl=" + ConfigMomo.REDIRECT_URL +
                    "&requestId=" + momoOrderId +
                    "&requestType=payWithMethod"; // sandbox wallet type

            String signature = signHmacSHA256(rawSignature);

            JSONObject requestBody = new JSONObject();
            requestBody.put("partnerCode", ConfigMomo.PARTNER_CODE);
            requestBody.put("accessKey", ConfigMomo.ACCESS_KEY);
            requestBody.put("requestId", momoOrderId);
            requestBody.put("amount", amount.toString());
            requestBody.put("orderId", momoOrderId);
            requestBody.put("orderInfo", orderInfo); // **không encode ở đây**
            requestBody.put("redirectUrl", ConfigMomo.REDIRECT_URL);
            requestBody.put("ipnUrl", ConfigMomo.IPN_URL);
            requestBody.put("requestType", "payWithMethod");
            requestBody.put("extraData", extraData);
            requestBody.put("signature", signature);

            // Gửi request
            URL url = new URL(ConfigMomo.ENDPOINT);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(requestBody.toString().getBytes(StandardCharsets.UTF_8));
            }

            InputStream is = conn.getResponseCode() == 200 ? conn.getInputStream() : conn.getErrorStream();
            StringBuilder response = new StringBuilder();
            try (var br = new java.io.BufferedReader(new java.io.InputStreamReader(is, StandardCharsets.UTF_8))) {
                String line;
                while ((line = br.readLine()) != null) response.append(line);
            }

            return response.toString();

        } catch (Exception e) {
            e.printStackTrace();
            return new JSONObject().put("error", e.getMessage()).toString();
        }
    }

    // ================= HMAC SHA256 =================
    private String signHmacSHA256(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec =
                new SecretKeySpec(ConfigMomo.SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder result = new StringBuilder();
        for (byte b : hash) result.append(String.format("%02x", b));
        return result.toString();
    }
}