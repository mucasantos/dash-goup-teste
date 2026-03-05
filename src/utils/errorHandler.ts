import { toast } from "react-hot-toast";

export interface ApiError {
  status?: number;
  data?: {
    message?:
      | {
          code?: string;
          message?: string;
          data?: {
            status?: number;
          };
        }
      | string;
  };
}

export const handleApiError = (error: unknown) => {
  console.log("error: ", error)
  let errorMessage = "Ocorreu um erro inesperado";

  if (typeof error === "object" && error !== null) {
    const err = error as ApiError;
    if (typeof err.data?.message === "string") {
      errorMessage = err.data.message;
    }
    else if (
      typeof err.data?.message === "object" &&
      err.data.message?.message
    ) {
      errorMessage = err.data.message.message;
    }
  }

  toast.error(errorMessage, {
    duration: 2000,
  });
};
