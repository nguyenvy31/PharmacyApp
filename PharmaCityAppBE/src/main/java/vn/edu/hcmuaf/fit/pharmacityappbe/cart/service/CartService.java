package vn.edu.hcmuaf.fit.pharmacityappbe.cart.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.entity.User;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.repository.UserRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.cart.dto.AddToCartRequest;
import vn.edu.hcmuaf.fit.pharmacityappbe.cart.dto.CartItemDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.cart.dto.CartSummaryDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.cart.dto.UpdateCartItemRequest;
import vn.edu.hcmuaf.fit.pharmacityappbe.cart.entity.CartItem;
import vn.edu.hcmuaf.fit.pharmacityappbe.cart.repository.CartItemRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.entity.Medicine;
import vn.edu.hcmuaf.fit.pharmacityappbe.shop.repository.MedicineRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository,
                       MedicineRepository medicineRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.medicineRepository = medicineRepository;
        this.userRepository = userRepository;
    }

    private User getUserOrThrow(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public CartSummaryDto getCart(Integer userId) {
        User user = getUserOrThrow(userId);
        List<CartItem> items = cartItemRepository.findByUserOrderByIdDesc(user);

        List<CartItemDto> dtoList = items.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        int totalQuantity = dtoList.stream()
                .mapToInt(CartItemDto::getQty)
                .sum();

        long subtotal = dtoList.stream()
                .mapToLong(i -> (i.getPrice() == null ? 0 : i.getPrice()) * i.getQty())
                .sum();

        return new CartSummaryDto(dtoList, totalQuantity, subtotal);
    }

    public CartSummaryDto addToCart(AddToCartRequest req) {
        User user = getUserOrThrow(req.getUserId());
        Medicine medicine = medicineRepository.findById(req.getMedicineId())
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found"));

        int qty = (req.getQty() == null || req.getQty() <= 0) ? 1 : req.getQty();

        CartItem item = cartItemRepository.findByUserAndMedicine(user, medicine)
                .orElseGet(() -> {
                    CartItem ci = new CartItem();
                    ci.setUser(user);
                    ci.setMedicine(medicine);
                    ci.setQuantity(0);
                    return ci;
                });

        item.setQuantity(item.getQuantity() + qty);
        cartItemRepository.save(item);

        return getCart(user.getId());
    }

    public CartSummaryDto updateItem(UpdateCartItemRequest req) {
        User user = getUserOrThrow(req.getUserId());
        Medicine medicine = medicineRepository.findById(req.getMedicineId())
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found"));

        int qty = req.getQty() == null ? 0 : req.getQty();

        cartItemRepository.findByUserAndMedicine(user, medicine)
                .ifPresent(item -> {
                    if (qty <= 0) {
                        cartItemRepository.delete(item);
                    } else {
                        item.setQuantity(qty);
                        cartItemRepository.save(item);
                    }
                });

        return getCart(user.getId());
    }

    public CartSummaryDto removeItem(Integer userId, Integer medicineId) {
        User user = getUserOrThrow(userId);
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found"));

        cartItemRepository.deleteByUserAndMedicine(user, medicine);

        return getCart(user.getId());
    }

    public void clearCart(Integer userId) {
        User user = getUserOrThrow(userId);
        cartItemRepository.deleteByUser(user);
    }

    private CartItemDto toDto(CartItem item) {
        Medicine m = item.getMedicine();
        return new CartItemDto(
                m.getId(),
                m.getName(),
                m.getPrice(),
                m.getImageUrl(),
                item.getQuantity()
        );
    }
}
