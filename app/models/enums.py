import enum

class StatusRequestEnum(str, enum.Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"