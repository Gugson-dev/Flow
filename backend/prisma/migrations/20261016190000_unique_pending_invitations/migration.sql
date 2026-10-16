CREATE UNIQUE INDEX "ProjectInvitation_one_pending_per_user"
ON "ProjectInvitation"("projectId", "receiverId")
WHERE "status" = 'PENDING';
