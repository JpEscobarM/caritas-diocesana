import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-ring aria-invalid:border-destructive aria-invalid:bg-red-50 flex min-h-28 w-full rounded-lg border-2 bg-input-background px-4 py-3 text-base leading-relaxed shadow-xs transition-[border-color,box-shadow] outline-none focus-visible:outline-3 focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-80",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
