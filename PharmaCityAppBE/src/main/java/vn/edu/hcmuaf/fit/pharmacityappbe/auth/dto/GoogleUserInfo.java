package vn.edu.hcmuaf.fit.pharmacityappbe.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleUserInfo {
    private String sub;
    private String email;
    private String name;
    private String picture;
    private String email_verified;

    private String aud;
    private String iss;
    private String exp;
}
