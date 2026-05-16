package vn.edu.hcmuaf.fit.pharmacityappbe.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.dto.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "RESTful API cho đăng ký, đăng nhập, xác thực OTP")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Đăng ký tài khoản mới")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        ApiResponse<Void> response = authService.register(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(summary = "Đăng nhập bằng số điện thoại")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        ApiResponse<AuthResponse> response = authService.login(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(summary = "Đăng nhập bằng email")
    @PostMapping("/login-email")
    public ResponseEntity<ApiResponse<AuthResponse>> loginByEmail(@Valid @RequestBody EmailLoginRequest request) {
        ApiResponse<AuthResponse> response = authService.loginByEmail(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(summary = "Đăng nhập bằng Google")
    @PostMapping("/login-google")
    public ResponseEntity<ApiResponse<AuthResponse>> loginGoogle(
            @RequestBody GoogleLoginRequest request) {

        ApiResponse<AuthResponse> response =
                authService.loginWithGoogle(request.getIdToken());

        return ResponseEntity.ok(response);
    }
    @Operation(summary = "Đăng nhập bằng facebook")
    @PostMapping("/login-facebook")
    public ResponseEntity<ApiResponse<AuthResponse>> loginFacebook(
            @RequestBody FacebookLoginRequest request) {

        ApiResponse<AuthResponse> response =
                authService.loginWithFacebook(request.getAccessToken());

        return ResponseEntity.ok(response);
    }
    @GetMapping("/admin/test")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String testAdmin() {
        return "Only admin";
    }


    @Operation(summary = "Xác thực mã OTP")
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        ApiResponse<Void> response = authService.verifyOtp(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(summary = "Gửi lại mã OTP")
    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        ApiResponse<Void> response = authService.resendOtp(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(summary = "Quên mật khẩu – gửi OTP qua email")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        ApiResponse<Void> response = authService.forgotPassword(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(summary = "Đặt lại mật khẩu bằng OTP")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        ApiResponse<Void> response = authService.resetPassword(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(summary = "Lấy thông tin người dùng theo ID")
    @GetMapping("/user/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable int id) {
        ApiResponse<UserDto> response = authService.getUserById(id);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(summary = "Cập nhật thông tin người dùng")
    @PutMapping("/user/{id}")
    public ResponseEntity<ApiResponse<Void>> updateUser(
            @PathVariable int id,
            @RequestBody UpdateUserRequest request
    ) {
        ApiResponse<Void> response = authService.updateUser(id, request);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }


}
