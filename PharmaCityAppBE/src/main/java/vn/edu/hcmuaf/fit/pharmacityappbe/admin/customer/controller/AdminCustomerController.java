package vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.dto.AdminCustomerDetailDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.dto.AdminCustomerListDto;
import vn.edu.hcmuaf.fit.pharmacityappbe.admin.customer.service.AdminCustomerService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final AdminCustomerService service;

    @GetMapping
    public List<AdminCustomerListDto> getCustomers() {
        return service.getAllCustomers();
    }

    @GetMapping("/{id}")
    public AdminCustomerDetailDto getDetail(@PathVariable Integer id) {
        return service.getCustomerDetail(id);
    }

}
