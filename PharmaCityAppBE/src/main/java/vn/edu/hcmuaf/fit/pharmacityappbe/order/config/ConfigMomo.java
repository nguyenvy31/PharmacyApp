package vn.edu.hcmuaf.fit.pharmacityappbe.order.config;

public class ConfigMomo {

    // Sandbox endpoint
    public static final String ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
    public static final String QUERY_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/query";

    // Test credentials (sandbox public)
    public static final String PARTNER_CODE = "MOMO";
    public static final String ACCESS_KEY = "F8BBA842ECF85";
    public static final String SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

    // Backend return URL
    public static final String BASE_URL = "http://10.0.2.2:8080"; // Emulator
    // public static final String BASE_URL = "http://192.168.1.x:8080"; // Real device

    // Momo redirect về backend trước
    public static final String REDIRECT_URL = BASE_URL + "/api/v1/payment/momo/momo-return";

    // IPN URL cũng phải là HTTP/HTTPS
    public static final String IPN_URL = BASE_URL + "/api/v1/payment/momo/momo-ipn";

    public static final String REQUEST_TYPE = "payWithMethod";
}
