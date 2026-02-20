import type { Schema } from "express-validator";

export const RegisterSchema: Schema = {
    names: {
        in: ["body"],
        exists: {
            errorMessage: "Name is required",
        },
        isString: {
            errorMessage: "Name must be a string",
        },
        isLength: {
            options: { min: 1, max: 50 },
            errorMessage: "Name must be between 1 and 50 characters",
        },
        trim: true,
    },
    lastNames: {
        in: ["body"],
        exists: {
            errorMessage: "lastNames is required",
        },
        isString: {
            errorMessage: "lastNames must be a string",
        },
        isLength: {
            options: { min: 1, max: 50 },
            errorMessage: "lastNames must be between 1 and 50 characters",
        },
        trim: true,
    },
    typeOfDentityDocument: {
        in: ["body"],
        exists: {
            errorMessage: "typeOfDentityDocument is required",
        },
        isString: {
            errorMessage: "typeOfDentityDocument must be a string",
        },
        isLength: {
            options: { min: 1, max: 50 },
            errorMessage:
                "typeOfDentityDocument must be between 1 and 50 characters",
        },
        trim: true,
    },
    idDocumentNumber: {
        in: ["body"],
        exists: {
            errorMessage: "idDocumentNumber is required",
        },
        isString: {
            errorMessage: "idDocumentNumber must be a string",
        },
        isLength: {
            options: { min: 5, max: 50 },
            errorMessage:
                "idDocumentNumber must be between 5 and 50 characters",
        },
        trim: true,
    },
    phoneNumber: {
        in: ["body"],
        exists: {
            errorMessage: "phoneNumber is required",
        },
        isString: {
            errorMessage: "phoneNumber must be a string",
        },
        isLength: {
            options: { min: 7, max: 20 },
            errorMessage: "phoneNumber must be between 7 and 20 digits",
        },
        matches: {
            options: /^[0-9+\-() ]+$/,
            errorMessage:
                "phoneNumber must contain only digits or symbols (+, -, () )",
        },
        trim: true,
    },
    email: {
        in: ["body"],
        exists: {
            errorMessage: "Email is required",
        },
        isEmail: {
            errorMessage: "Must be a valid email address",
        },
        normalizeEmail: true,
        isLength: {
            options: { max: 100 },
            errorMessage: "Email must not exceed 100 characters",
        },
        trim: true,
    },
    password: {
        in: ["body"],
        exists: {
            errorMessage: "Password is required",
        },
        isString: {
            errorMessage: "Password must be a string",
        },
        isLength: {
            options: { min: 8, max: 60 },
            errorMessage: "Password must be between 8 and 60 characters",
        },
        matches: {
            options:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            errorMessage:
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
    },
};

export const UserConfirmationSchema: Schema = {
    token: {
        in: ["body"],
        exists: {
            errorMessage: "Token is required",
        },
        isString: {
            errorMessage: "Token must be a string",
        },
        isLength: {
            options: { min: 6, max: 6 },
            errorMessage: "Token must be 6 characters",
        },
    },
};

export const UserLoginSchema: Schema = {
    email: {
        in: ["body"],
        exists: {
            errorMessage: "Email is required",
        },
        isEmail: {
            errorMessage: "Must be a valid email address",
        },
        normalizeEmail: true,
        isLength: {
            options: { max: 50 },
            errorMessage: "Email must not exceed 50 characters",
        },
        trim: true,
    },
    password: {
        in: ["body"],
        exists: {
            errorMessage: "Password is required",
        },
        isString: {
            errorMessage: "Password must be a string",
        },
        isLength: {
            options: { min: 8, max: 60 },
            errorMessage: "Password must be between 8 and 60 characters",
        },
    },
};

export const ForgotPasswordSchema: Schema = {
    email: {
        in: ["body"],
        exists: {
            errorMessage: "Email is required",
        },
        isEmail: {
            errorMessage: "Must be a valid email address",
        },
        normalizeEmail: true,
        isLength: {
            options: { max: 50 },
            errorMessage: "Email must not exceed 50 characters",
        },
        trim: true,
    },
};

export const ValidateTokenSchema: Schema = {
    token: {
        in: ["body"],
        exists: {
            errorMessage: "Token is required",
        },
        isString: {
            errorMessage: "Token must be a string",
        },
        isLength: {
            options: { min: 6, max: 6 },
            errorMessage: "Token must be 6 characters",
        },
    },
};

export const ResetPasswordSchema: Schema = {
    token: {
        in: ["params"],
        exists: {
            errorMessage: "Token is required",
        },
        isString: {
            errorMessage: "Token must be a string",
        },
        isLength: {
            options: { min: 6, max: 6 },
            errorMessage: "Token must be 6 characters long",
        },
    },
    password: {
        in: ["body"],
        exists: {
            errorMessage: "Password is required",
        },
        isString: {
            errorMessage: "Password must be a string",
        },
        isLength: {
            options: { min: 8, max: 60 },
            errorMessage: "Password must be between 8 and 60 characters",
        },
        matches: {
            options:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            errorMessage:
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
    },
    confirmPassword: {
        in: ["body"],
        exists: {
            errorMessage: "Password confirmation is required",
        },
        custom: {
            options: (value: string, { req }) => {
                if (value !== req.body.password) {
                    throw new Error(
                        "Password confirmation does not match password",
                    );
                }
                return true;
            },
        },
    },
};

/*      privates Schemas       */
export const UpdatePasswordSchema: Schema = {
    authorization: {
        in: ["headers"],
        exists: {
            errorMessage: "Authorization header is required",
        },
        matches: {
            options: /^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/,
            errorMessage:
                "Authorization header must be in the format: Bearer <token>",
        },
    },
    currentPassword: {
        in: ["body"],
        exists: {
            errorMessage: "Current password is required",
        },
        isString: {
            errorMessage: "Current password must be a string",
        },
        isLength: {
            options: { min: 8, max: 60 },
            errorMessage:
                "Current password must be between 8 and 60 characters",
        },
    },
    password: {
        in: ["body"],
        exists: {
            errorMessage: "Password is required",
        },
        isString: {
            errorMessage: "Password must be a string",
        },
        isLength: {
            options: { min: 8, max: 60 },
            errorMessage: "Password must be between 8 and 60 characters",
        },
        matches: {
            options:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            errorMessage:
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
    },
    confirmPassword: {
        in: ["body"],
        exists: {
            errorMessage: "Password confirmation is required",
        },
        custom: {
            options: (value: string, { req }) => {
                if (value !== req.body.password) {
                    throw new Error(
                        "Password confirmation does not match password",
                    );
                }
                return true;
            },
        },
    },
};

export const CheckAuthUserPasswordSchema: Schema = {
    authorization: {
        in: ["headers"],
        exists: {
            errorMessage: "Authorization header is required",
        },
        matches: {
            options: /^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/,
            errorMessage:
                "Authorization header must be in the format: Bearer <token>",
        },
    },
    password: {
        in: ["body"],
        exists: {
            errorMessage: "Password is required",
        },
        isString: {
            errorMessage: "Password must be a string",
        },
        isLength: {
            options: { min: 8, max: 60 },
            errorMessage: "Password must be between 8 and 60 characters",
        },
    },
};
