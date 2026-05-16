package vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.dto.AdminCustomerDetailDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.dto.AdminCustomerListDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.repository.AdminCustomerRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCustomerService {

    private final AdminCustomerRepository repository;

    public List<AdminCustomerListDto> getAllCustomers() {
        return repository.findAllCustomersForAdmin();
    }

    // Chi tiết khách hàng
    public AdminCustomerDetailDto getCustomerDetail(Integer id) {
        AdminCustomerDetailDto dto = repository.findCustomerDetail(id);
        if (dto == null) {
            throw new RuntimeException("Customer not found with id: " + id);
        }
        return dto;
    }
}
