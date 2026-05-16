package vn.edu.hcmuaf.fit.pharmacityappbe.chatbox.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChatService {

    // JdbcTemplate dùng để query database
    private final JdbcTemplate jdbcTemplate;

    // Environment để đọc biến trong application.properties
    private final Environment env;

    // cấu hình chọn provider AI
    @Value("${chat.provider:openai}")
    private String chatProvider;

    // API key OpenAI
    @Value("${openai.api.key:}")
    private String openAiKey;

    // API key OpenRouter (fallback nếu OpenAI hết quota)
    @Value("${openrouter.api.key:}")
    private String openRouterKey;

    // Constructor inject dependency
    public ChatService(JdbcTemplate jdbcTemplate, Environment env) {
        this.jdbcTemplate = jdbcTemplate;
        this.env = env;
    }

    public Map<String, Object> searchMedicine(String message, String column) {

        Map<String, Object> result = new HashMap<>();

        String sql = """
        SELECT id, name, usage_text, image_url AS imageUrl, price
        FROM medicine
        WHERE LOWER(%s) LIKE LOWER(?)
        LIMIT 5
    """.formatted(column);

        List<Map<String, Object>> medicines =
                jdbcTemplate.queryForList(sql, "%" + message + "%");

        if (medicines.isEmpty()) {

            result.put("reply",
                    "Xin lỗi, hiện chưa tìm thấy thuốc phù hợp trong hệ thống. " +
                            "Bạn có thể mô tả rõ hơn triệu chứng như đau đầu, sốt, ho...");

            result.put("fromDb", medicines);

            return result;
        }

        StringBuilder prompt = new StringBuilder();

        prompt.append("Người dùng hỏi: ").append(message).append("\n\n");

        prompt.append("Danh sách thuốc:\n");

        for (int i = 0; i < medicines.size(); i++) {

            Map<String, Object> m = medicines.get(i);

            prompt.append(i + 1)
                    .append(". ")
                    .append(m.get("name"))
                    .append(" - ")
                    .append(m.get("usage_text"))
                    .append("\n");
        }

        prompt.append("""

        Hãy chọn thuốc phù hợp nhất từ danh sách trên.

        QUY TẮC:
        - Chỉ trả lời bằng số thứ tự thuốc.
        - Không viết tên thuốc.
        - Không giải thích.
        - Nếu không chắc chắn hãy trả lời 0.
        """);

        try {

            String aiReply = callChatAPI(prompt.toString(), chatProvider);

            int index = extractNumber(aiReply);

            if (index <= 0 || index > medicines.size()) {

                result.put("reply",
                        "Xin lỗi, tôi chưa thể đề xuất thuốc phù hợp. Bạn nên hỏi dược sĩ hoặc bác sĩ.");

                result.put("fromDb", medicines);

                return result;
            }

            Map<String, Object> selected = medicines.get(index - 1);

            String finalReply =
                    "Bạn có thể tham khảo thuốc: **" +
                            selected.get("name") +
                            "**.\nCông dụng: " +
                            selected.get("usage_text") +
                            "\n\nVui lòng đọc kỹ hướng dẫn sử dụng hoặc hỏi dược sĩ trước khi dùng.";

            result.put("reply", finalReply);
            result.put("fromDb", medicines);

        }
        catch (HttpClientErrorException.TooManyRequests e) {

            try {

                String aiReply = callChatAPI(prompt.toString(), "openrouter");

                int index = extractNumber(aiReply);

                if (index <= 0 || index > medicines.size()) {

                    result.put("reply",
                            "Xin lỗi, tôi chưa thể đề xuất thuốc phù hợp.");
                } else {

                    Map<String, Object> selected = medicines.get(index - 1);

                    result.put("reply",
                            "Bạn có thể tham khảo thuốc: **" +
                                    selected.get("name") +
                                    "**.\nCông dụng: " +
                                    selected.get("usage_text"));
                }

            } catch (Exception ex) {

                result.put("reply",
                        "Xin lỗi, hệ thống đang quá tải. Vui lòng thử lại sau.");
            }

            result.put("fromDb", medicines);

        }
        catch (Exception ex) {

            ex.printStackTrace();

            result.put("reply",
                    "Xin lỗi, có lỗi khi kết nối dịch vụ AI.");

            result.put("fromDb", medicines);
        }

        return result;
    }

    // ===== HÀM TÁCH SỐ TỪ RESPONSE AI =====
    // ví dụ AI trả "2" hoặc "Thuốc phù hợp là 2"
    private int extractNumber(String text) {

        Pattern pattern = Pattern.compile("\\d+");

        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return Integer.parseInt(matcher.group());
        }

        return 0;
    }

    // ===== HÀM GỌI API CHATGPT =====
    public   String callChatAPI(String prompt, String provider) {

        RestTemplate restTemplate = new RestTemplate();

        String apiUrl;
        String apiKey;

        if ("openrouter".equalsIgnoreCase(provider)) {

            apiUrl = "https://openrouter.ai/api/v1/chat/completions";
            apiKey = openRouterKey;

        } else {

            apiUrl = "https://api.openai.com/v1/chat/completions";
            apiKey = openAiKey;
        }

        // body request gửi cho AI
        Map<String, Object> body = new HashMap<>();

        body.put("model", "gpt-3.5-turbo");

        body.put("messages",
                List.of(
                        Map.of("role", "user", "content", prompt)
                ));

        body.put("max_tokens", 50);
        body.put("temperature", 0);

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);

        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(body, headers);

        ResponseEntity<Map> resp =
                restTemplate.exchange(apiUrl, HttpMethod.POST, entity, Map.class);

        Map firstChoice =
                (Map) ((List<?>) resp.getBody().get("choices")).get(0);

        Map messageObj =
                (Map) firstChoice.get("message");

        return (String) messageObj.get("content");
    }
}