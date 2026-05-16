package vn.edu.hcmuaf.fit.pharmacityappbe.auth.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.dto.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.entity.User;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.repository.UserRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.security.JwtUtil;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final Random random = new Random();
    private final GoogleAuthService googleAuthService;
    private final FacebookAuthService facebookAuthService;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, EmailService emailService, GoogleAuthService googleAuthService, FacebookAuthService facebookAuthService, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.googleAuthService = googleAuthService;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.facebookAuthService = facebookAuthService;
        this.jwtUtil = jwtUtil;
    }

    // ======================
    // REGISTER
    // ======================
    public ApiResponse<Void> register(RegisterRequest request) {

        if (userRepository.existsByPhone(request.getPhone())) {
            return new ApiResponse<>(false, "Số điện thoại đã được đăng ký.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return new ApiResponse<>(false, "Email đã được đăng ký.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setVerified(false);
        user.setRole("ROLE_USER");

        // Tạo OTP
        String otpCode = String.format("%06d", random.nextInt(1_000_000));
        user.setOtpCode(otpCode);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        userRepository.save(user);

        // Gửi OTP qua email
        emailService.sendOtpEmail(user.getEmail(), otpCode);

        return new ApiResponse<>(true, "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.");
    }

    // ======================
    // LOGIN bằng PHONE
    // ======================
    public ApiResponse<AuthResponse> login(LoginRequest request) {
        User user = userRepository.findByPhone(request.getPhone()).orElse(null);

        if (user == null) {
            return new ApiResponse<>(false, "Số điện thoại hoặc mật khẩu không đúng.");
        }

        if (!user.isVerified()) {
            return new ApiResponse<>(false, "Tài khoản chưa được xác minh OTP.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new ApiResponse<>(false, "Số điện thoại hoặc mật khẩu không đúng.");
        }


        String token = jwtUtil.generateToken(user.getId(), user.getRole());

        UserDto dto = new UserDto(
                user.getId(),
                user.getName(),
                user.getPhone(),
                user.getEmail(),
                user.isVerified(),
                user.getRole()
        );

        return new ApiResponse<>(true, "Đăng nhập thành công.",
                new AuthResponse(token, dto));
    }

    // ======================
    // LOGIN bằng EMAIL
    // ======================
    public ApiResponse<AuthResponse> loginByEmail(EmailLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return new ApiResponse<>(false, "Email hoặc mật khẩu không đúng.");
        }

        if (!user.isVerified()) {
            return new ApiResponse<>(false, "Email chưa được xác minh.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new ApiResponse<>(false, "Email hoặc mật khẩu không đúng.");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        UserDto dto = new UserDto(
                user.getId(),
                user.getName(),
                user.getPhone(),
                user.getEmail(),
                user.isVerified(),
                user.getRole()
        );

        return new ApiResponse<>(true, "Đăng nhập thành công.",
                new AuthResponse(token, dto));
    }
    //Login bằng google

    public ApiResponse<AuthResponse> loginWithGoogle(String idToken) {

        GoogleUserInfo info = googleAuthService.verify(idToken);

        if (info == null) {
            return new ApiResponse<>(false, "Google token không hợp lệ");
        }

        // 1️⃣ Check email verified
        if (!"true".equals(info.getEmail_verified())) {
            return new ApiResponse<>(false, "Email Google chưa được xác minh");
        }

        // 2️⃣ Check audience
        if (!info.getAud().equals(
                "878332080976-qn2jqgop39a2m3eiej14qq7ekdebvgmj.apps.googleusercontent.com")) {
            return new ApiResponse<>(false, "Google token không đúng ứng dụng");
        }

        // 3️⃣ Check issuer
        if (!info.getIss().equals("https://accounts.google.com")
                && !info.getIss().equals("accounts.google.com")) {
            return new ApiResponse<>(false, "Issuer không hợp lệ");
        }

        // 4️⃣ Check expiration
        long exp = Long.parseLong(info.getExp());
        if (System.currentTimeMillis() / 1000 > exp) {
            return new ApiResponse<>(false, "Google token đã hết hạn");
        }

        // 🔴 5️⃣ TÌM USER TRƯỚC
        User user = userRepository.findByEmail(info.getEmail()).orElse(null);

        // 🔒 6️⃣ CHẶN ACCOUNT LOCAL
        if (user != null && !"GOOGLE".equals(user.getProvider())) {
            return new ApiResponse<>(false,
                    "Email này đã đăng ký bằng tài khoản thường. Vui lòng đăng nhập bằng mật khẩu.");
        }

        // 🆕 7️⃣ NẾU CHƯA CÓ → TẠO USER GOOGLE
        if (user == null) {
            user = new User();
            user.setEmail(info.getEmail());
            user.setName(info.getName());
            user.setPhone("0000000000");
            user.setVerified(true);
            user.setProvider("GOOGLE");
            user.setProviderId(info.getSub());
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            userRepository.save(user);
        }

        // ✅ 8️⃣ LOGIN THÀNH CÔNG
        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        UserDto dto = new UserDto(
                user.getId(),
                user.getName(),
                user.getPhone(),
                user.getEmail(),
                user.isVerified(),
                user.getRole()
        );

        return new ApiResponse<>(true, "Đăng nhập Google thành công",
                new AuthResponse(token, dto));
    }

    // login by facebook

    public ApiResponse<AuthResponse> loginWithFacebook(String accessToken    ) {

        FacebookUserInfo info = facebookAuthService.verify(accessToken);

        if (info == null || info.getId() == null) {
            return new ApiResponse<>(false, "Facebook token không hợp lệ");
        }

        String email = info.getEmail();
        if (email == null) {
            email = info.getId() + "@facebook.local";
        }


        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setName(info.getName());
            user.setPhone("FB_" + info.getId());
            user.setVerified(true);
            user.setProvider("FACEBOOK");
            user.setProviderId(info.getId());
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        UserDto dto = new UserDto(
                user.getId(),
                user.getName(),
                user.getPhone(),
                user.getEmail(),
                user.isVerified(),
                user.getRole()
        );

        return new ApiResponse<>(true, "Đăng nhập Facebook thành công",
                new AuthResponse(token, dto));
    }


    // ======================
    // VERIFY OTP bằng EMAIL
    // ======================
    public ApiResponse<Void> verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return new ApiResponse<>(false, "Không tìm thấy tài khoản với email này.");
        }

        if (user.isVerified()) {
            return new ApiResponse<>(true, "Tài khoản đã được xác minh trước đó.");
        }

        if (user.getOtpCode() == null || user.getOtpExpiry() == null) {
            return new ApiResponse<>(false, "Không có mã OTP hợp lệ. Vui lòng đăng ký lại.");
        }

        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            return new ApiResponse<>(false, "Mã OTP đã hết hạn. Vui lòng đăng ký lại.");
        }

        if (!user.getOtpCode().equals(request.getOtp())) {
            return new ApiResponse<>(false, "Mã OTP không đúng.");
        }

        user.setVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return new ApiResponse<>(true, "Xác nhận OTP thành công.");
    }

    // ======================
    // RESEND OTP
    // ======================
    public ApiResponse<Void> resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return new ApiResponse<>(false, "Email không tồn tại trong hệ thống.");
        }

        if (user.isVerified()) {
            return new ApiResponse<>(false, "Tài khoản đã được xác minh, không cần gửi lại OTP.");
        }

        String otpCode = String.format("%06d", random.nextInt(1_000_000));
        user.setOtpCode(otpCode);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otpCode);

        return new ApiResponse<>(true, "Đã gửi lại mã OTP đến email.");
    }

    // ======================
    // FORGOT PASSWORD – gửi OTP reset
    // ======================
    public ApiResponse<Void> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return new ApiResponse<>(false, "Email không tồn tại.");
        }

        String otpCode = String.format("%06d", random.nextInt(1_000_000));
        user.setOtpCode(otpCode);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otpCode);

        return new ApiResponse<>(true, "Đã gửi OTP đặt lại mật khẩu qua email.");
    }

    // ======================
    // RESET PASSWORD bằng OTP
    // ======================
    public ApiResponse<Void> resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return new ApiResponse<>(false, "Email không tồn tại.");
        }

        if (user.getOtpCode() == null || user.getOtpExpiry() == null) {
            return new ApiResponse<>(false, "OTP không hợp lệ, vui lòng yêu cầu mã mới.");
        }

        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            return new ApiResponse<>(false, "OTP đã hết hạn.");
        }

        if (!user.getOtpCode().equals(request.getOtp())) {
            return new ApiResponse<>(false, "OTP không chính xác.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return new ApiResponse<>(true, "Đặt lại mật khẩu thành công.");
    }

    // ======================
    // GET USER BY ID
    // ======================
    public ApiResponse<UserDto> getUserById(int id) {
        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return new ApiResponse<>(false, "Không tìm thấy user.");
        }

        UserDto dto = new UserDto(
                user.getId(),
                user.getName(),
                user.getPhone(),
                user.getEmail(),
                user.isVerified(),
                user.getRole()
        );

        return new ApiResponse<>(true, "Lấy thông tin thành công", dto);
    }

    // ======================
    // UPDATE USER
    // ======================
    public ApiResponse<Void> updateUser(int id, UpdateUserRequest req) {

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return new ApiResponse<>(false, "Không tìm thấy user.");
        }

        if (req.getPhone() != null && !req.getPhone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(req.getPhone())) {
                return new ApiResponse<>(false, "Số điện thoại đã tồn tại.");
            }
            user.setPhone(req.getPhone());
        }

        if (req.getEmail() != null && !req.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(req.getEmail())) {
                return new ApiResponse<>(false, "Email đã tồn tại.");
            }
            user.setEmail(req.getEmail());
        }

        if (req.getName() != null) {
            user.setName(req.getName());
        }

        userRepository.save(user);

        return new ApiResponse<>(true, "Cập nhật thông tin thành công.");
    }
}
