import { Router } from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessage, markMessageAsSeen, sendMessage, userForSideBar } from "../controller/message.controller.js";

const messageRouter = Router()

messageRouter.get("/users",protectRoute,userForSideBar)
messageRouter.get('/:id', protectRoute, getMessage)
messageRouter.put('/mark/:id', protectRoute,markMessageAsSeen)
messageRouter.post('/send/:id',protectRoute,sendMessage)


export default messageRouter;