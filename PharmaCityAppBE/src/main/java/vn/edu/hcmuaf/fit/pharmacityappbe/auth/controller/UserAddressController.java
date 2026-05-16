package vn.edu.hcmuaf.fit.pharmacityappbe.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.dto.AddressDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.service.UserAddressService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
@CrossOrigin(origins = "*")
@Tag(name = "UserAddress", description = "Sổ địa chỉ giao hàng")
public class UserAddressController {

    private final UserAddressService addressService;

    public UserAddressController(UserAddressService addressService) {
        this.addressService = addressService;
    }

    @Operation(summary = "Lấy danh sách địa chỉ của user")
    @GetMapping
    public List<AddressDto> list(@RequestParam Integer userId) {
        return addressService.listByUser(userId);
    }

    @Operation(summary = "Thêm địa chỉ mới")
    @PostMapping
    public AddressDto create(@RequestParam Integer userId,
                             @RequestBody AddressDto req) {
        return addressService.create(userId, req);
    }

    @Operation(summary = "Cập nhật địa chỉ")
    @PutMapping("/{id}")
    public AddressDto update(@RequestParam Integer userId,
                             @PathVariable Integer id,
                             @RequestBody AddressDto req) {
        return addressService.update(userId, id, req);
    }

    @Operation(summary = "Xoá địa chỉ")
    @DeleteMapping("/{id}")
    public void delete(@RequestParam Integer userId,
                       @PathVariable Integer id) {
        addressService.delete(userId, id);
    }

    @Operation(summary = "Đặt làm địa chỉ mặc định")
    @PutMapping("/{id}/default")
    public AddressDto setDefault(@RequestParam Integer userId,
                                 @PathVariable Integer id) {
        return addressService.setDefault(userId, id);
    }
}
