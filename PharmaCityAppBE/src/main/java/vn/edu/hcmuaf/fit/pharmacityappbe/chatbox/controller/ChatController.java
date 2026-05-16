package vn.edu.hcmuaf.fit.pharmacityappbe.chatbox.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.pharmacityappbe.chatbox.service.ChatService;


import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin("*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/search")
    public Map<String, Object> chatSearch(@RequestBody Map<String, String> body) {

        String message = body.get("message");
        String column = body.get("column");

        return chatService.searchMedicine(message, column);
    }
}