import { FieldError } from "react-hook-form";

const ErrorDisplayComp = ({ error }: { error: FieldError | undefined }) => {
  if (!error) return null;
  return (
    <p
      aria-label={"error_status_" + error.ref?.name}
      className="text-red-600 font-semibold text-sm"
      data-for={error.ref?.name}
    >
      {error.message}
    </p>
  );
};

export default ErrorDisplayComp;
