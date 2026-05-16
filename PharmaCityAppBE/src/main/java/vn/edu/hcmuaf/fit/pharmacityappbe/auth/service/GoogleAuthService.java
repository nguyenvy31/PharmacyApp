package vn.edu.hcmuaf.fit.pharmacityappbe.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.dto.GoogleUserInfo;

@Service
public class GoogleAuthService {

    private final RestTemplate restTemplate = new RestTemplate();

    public GoogleUserInfo verify(String idToken) {
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        return restTemplate.getForObject(url, GoogleUserInfo.class);
    }
}
