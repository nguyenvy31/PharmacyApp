package vn.edu.hcmuaf.fit.pharmacityappbe.auth.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.dto.FacebookUserInfo;

@Service
public class FacebookAuthService {

    private final RestTemplate restTemplate = new RestTemplate();

    public FacebookUserInfo verify(String accessToken) {
        try {
            String url =
                    "https://graph.facebook.com/me" +
                            "?fields=id,name,email" +
                            "&access_token=" + accessToken;

            ResponseEntity<FacebookUserInfo> response =
                    restTemplate.getForEntity(url, FacebookUserInfo.class);

            return response.getBody();
        } catch (Exception e) {
            return null;
        }
    }
}
