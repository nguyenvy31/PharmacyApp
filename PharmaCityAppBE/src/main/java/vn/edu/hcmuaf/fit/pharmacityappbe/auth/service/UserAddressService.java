package vn.edu.hcmuaf.fit.pharmacityappbe.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.dto.AddressDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.entity.User;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.entity.UserAddress;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.repository.UserAddressRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserAddressService {

    private final UserRepository userRepository;
    private final UserAddressRepository addressRepository;

    public UserAddressService(UserRepository userRepository,
                              UserAddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    private User getUserOrThrow(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private AddressDto toDto(UserAddress ua) {
        return new AddressDto(
                ua.getId(),
                ua.getUser().getId(),
                ua.getFullname(),
                ua.getPhone(),
                ua.getAddress(),
                ua.isDefault()
        );
    }

    public List<AddressDto> listByUser(Integer userId) {
        User user = getUserOrThrow(userId);
        return addressRepository.findByUserOrderByIsDefaultDescIdDesc(user)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public AddressDto create(Integer userId, AddressDto req) {
        User user = getUserOrThrow(userId);

        UserAddress ua = new UserAddress();
        ua.setUser(user);
        ua.setFullname(req.getFullname());
        ua.setPhone(req.getPhone());
        ua.setAddress(req.getAddress());
        ua.setDefault(req.isDefault());

        UserAddress saved = addressRepository.save(ua);

        // Nếu là địa chỉ mặc định thì bỏ default các địa chỉ khác
        if (req.isDefault()) {
            List<UserAddress> list =
                    addressRepository.findByUserOrderByIsDefaultDescIdDesc(user);
            for (UserAddress a : list) {
                a.setDefault(a.getId() == saved.getId());   // 🔥 so sánh int
            }
        }

        return toDto(saved);
    }

    public AddressDto update(Integer userId, Integer id, AddressDto req) {
        User user = getUserOrThrow(userId);

        UserAddress ua = addressRepository.findById(id)
                .filter(a -> a.getUser().getId() == user.getId())   // 🔥 so sánh int
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));

        ua.setFullname(req.getFullname());
        ua.setPhone(req.getPhone());
        ua.setAddress(req.getAddress());

        if (req.isDefault()) {
            List<UserAddress> list =
                    addressRepository.findByUserOrderByIsDefaultDescIdDesc(user);
            for (UserAddress a : list) {
                a.setDefault(a.getId() == id);   // 🔥 so sánh int
            }
        } else {
            ua.setDefault(false);
        }

        return toDto(ua);
    }

    public void delete(Integer userId, Integer id) {
        User user = getUserOrThrow(userId);
        addressRepository.deleteByUserAndId(user, id);
    }

    public AddressDto setDefault(Integer userId, Integer id) {
        User user = getUserOrThrow(userId);
        List<UserAddress> list =
                addressRepository.findByUserOrderByIsDefaultDescIdDesc(user);

        UserAddress target = null;
        for (UserAddress ua : list) {
            boolean isDefault = ua.getId() == id;   // 🔥 so sánh int
            ua.setDefault(isDefault);
            if (isDefault) target = ua;
        }

        if (target == null) {
            throw new IllegalArgumentException("Address not found");
        }

        return toDto(target);
    }
}
