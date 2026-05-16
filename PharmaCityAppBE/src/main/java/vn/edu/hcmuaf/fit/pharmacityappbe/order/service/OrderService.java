package vn.edu.hcmuaf.fit.pharmacityappbe.order.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.inventory.repository.InventoryRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.entity.User;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.repository.UserRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.auth.service.EmailService;
import vn.edu.hcmuaf.fit.pharmacityappbe.cart.entity.CartItem;
import vn.edu.hcmuaf.fit.pharmacityappbe.cart.repository.CartItemRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.dto.CreateOrderRequest;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.dto.OrderDetailDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.dto.OrderItemDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.entity.Order;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.entity.OrderItem;
import vn.edu.hcmuaf.fit.pharmacityappbe.order.repository.OrderRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.dto.PromotionValidateResponse;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.entity.Promotion;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.repository.PromotionRepository;
import vn.edu.hcmuaf.fit.pharmacityappbe.promotion.service.PromotionService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final PromotionService promotionService;
    private final PromotionRepository promotionRepository;
    private final EmailService emailService;
    private final InventoryRepository inventoryRepository;


    public OrderService(OrderRepository orderRepository,
                        CartItemRepository cartItemRepository,
                        UserRepository userRepository,
                        PromotionService promotionService,
                        PromotionRepository promotionRepository,
                        EmailService emailService,
                        InventoryRepository inventoryRepository) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.promotionService = promotionService;
        this.promotionRepository = promotionRepository;
        this.emailService = emailService;
        this.inventoryRepository = inventoryRepository;
    }

    private User getUserOrThrow(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public OrderDetailDto createOrder(CreateOrderRequest req) {

        User user = getUserOrThrow(req.getUserId());

        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("Danh sách sản phẩm trống");
        }

        long subtotal = 0;

        for (OrderItemDto item : req.getItems()) {
            Integer medicineId = item.getMedicineId();
            Integer qty = item.getQuantity();

            var inv = inventoryRepository.findByMedicineId(medicineId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm"));
            long realPrice = inv.getMedicine().getPrice();

            if (inv.getStock() < qty) {
                throw new IllegalArgumentException("Sản phẩm không đủ hàng");
            }

            inv.setStock(inv.getStock() - qty);
            inventoryRepository.save(inv);

            subtotal += realPrice * qty;
        }

        long shippingFee = subtotal >= 300_000 ? 0 : 30_000;

        Promotion promotion = null;
        long discount = 0;

        // ====== ÁP DỤNG KHUYẾN MÃI ======
        if (req.getPromoCode() != null && !req.getPromoCode().isBlank()) {

            PromotionValidateResponse result =
                    promotionService.validate(req.getPromoCode(), subtotal);

            if (!result.isValid()) {
                throw new IllegalArgumentException(result.getMessage());
            }

            promotion = promotionRepository
                    .findById(result.getPromotionId())
                    .orElseThrow();

            discount = result.getDiscount();

            // trừ lượt sử dụng
            promotion.setUsed(promotion.getUsed() + 1);
        }

        long total = subtotal + shippingFee - discount;
        if (total < 0) total = 0;

        Order order = new Order();
        order.setUser(user);
        order.setPromotion(promotion);
        order.setDiscountAmount(discount);
        order.setShippingFee(shippingFee);
        order.setPaymentMethod(req.getPaymentMethod());
        if ("CARD".equals(req.getPaymentMethod())) {
            order.setPaymentStatus("PENDING");
            order.setStatus("PENDING");
        } else {
            order.setPaymentStatus("UNPAID");
            order.setStatus("PENDING");
        }
        order.setTotalAmount(total);
        order.setShippingAddress(req.getShippingAddress());
        order.setReceiverName(req.getReceiverName());
        order.setReceiverPhone(req.getReceiverPhone());
        order.setNote(req.getNote());
        order.setCreatedAt(LocalDateTime.now());

        List<OrderItem> items = req.getItems().stream().map(i -> {
            var inv = inventoryRepository.findByMedicineId(i.getMedicineId())
                    .orElseThrow();

            long realPrice = inv.getMedicine().getPrice();

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setMedicine(inv.getMedicine());
            oi.setQuantity(i.getQuantity());
            oi.setUnitPrice(realPrice);
            return oi;
        }).collect(Collectors.toList());

        order.setItems(items);


        Order saved = orderRepository.saveAndFlush(order);

        if (req.isFromCart()) {
            for (OrderItemDto item : req.getItems()) {
                cartItemRepository.deleteByUserAndMedicineId(user, item.getMedicineId());
            }
        }

        return toDetailDto(saved);
    }


    public List<OrderDetailDto> getOrders(Integer userId) {
        User user = getUserOrThrow(userId);
        return orderRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toDetailDto)
                .collect(Collectors.toList());
    }

    public OrderDetailDto getOrder(Integer id) {
        return orderRepository.findById(id)
                .map(this::toDetailDto)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }

    private OrderDetailDto toDetailDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(oi -> new OrderItemDto(
                        oi.getMedicine().getId(),
                        oi.getMedicine().getName(),
                        oi.getUnitPrice(),
                        oi.getQuantity()
                ))
                .collect(Collectors.toList());

        return new OrderDetailDto(
                order.getId(),
                "DH" + String.format("%05d", order.getId()),
                order.getUser().getId(),
                order.getTotalAmount(),
                order.getShippingFee(),
                order.getDiscountAmount(),
                order.getPromotion() != null ? order.getPromotion().getCode() : null,
                order.getShippingAddress(),
                order.getReceiverName(),
                order.getReceiverPhone(),
                order.getNote(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getCreatedAt(),
                itemDtos
        );
    }

    public void cancelOrder(Integer orderId, Integer userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getUser().getId() != userId) {
            throw new RuntimeException("Không có quyền hủy đơn này");
        }

        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Không thể hủy đơn ở trạng thái này");
        }

        if ("PAID".equals(order.getPaymentStatus())) {
            order.setPaymentStatus("REFUND_PENDING");
        }

        order.setStatus("CANCELED");
        order.getItems().forEach(item -> {
            Integer medicineId = item.getMedicine().getId();
            Integer qty = item.getQuantity();

            inventoryRepository.findByMedicineId(medicineId)
                    .ifPresent(inv -> {
                        inv.setStock(inv.getStock() + qty);
                        inventoryRepository.save(inv);
                    });
        });
        orderRepository.save(order);

        // ✅ Gửi email thông báo hủy đơn
        emailService.sendOrderCancelledEmail(order);
    }
}
