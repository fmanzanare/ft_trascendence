export class ChatSocket {
    chatSocket = null;
    chatMessages = [];
    gameInvitationReceived = false;
    gameInvitationResponse = false;
    hostGameId = null;
    guestGameId = null;
    chatNotification = false;

    constructor(chatSocket) {
        this.chatSocket = chatSocket;
    }
}