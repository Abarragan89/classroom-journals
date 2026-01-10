-- CreateIndex
CREATE INDEX "Alert_userId_type_idx" ON "Alert"("userId", "type");

-- CreateIndex
CREATE INDEX "ClassUser_classId_role_idx" ON "ClassUser"("classId", "role");

-- CreateIndex
CREATE INDEX "Comment_responseId_idx" ON "Comment"("responseId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_classId_idx" ON "Notification"("userId", "isRead", "classId");

-- CreateIndex
CREATE INDEX "PromptSession_classId_promptType_idx" ON "PromptSession"("classId", "promptType");

-- CreateIndex
CREATE INDEX "Response_studentId_completionStatus_idx" ON "Response"("studentId", "completionStatus");

-- CreateIndex
CREATE INDEX "Response_promptSessionId_idx" ON "Response"("promptSessionId");

-- CreateIndex
CREATE INDEX "StudentRequest_teacherId_classId_status_idx" ON "StudentRequest"("teacherId", "classId", "status");

-- CreateIndex
CREATE INDEX "StudentRequest_studentId_idx" ON "StudentRequest"("studentId");
