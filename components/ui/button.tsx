import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-[13px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-white text-neutral-950 hover:bg-neutral-200",
        secondary: "border border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.07]",
        ghost: "text-slate-300 hover:bg-white/[0.05] hover:text-white",
        danger: "border border-red-400/20 bg-red-400/10 text-red-200 hover:bg-red-400/15",
      },
      size: {
        sm: "h-8 px-2.5",
        md: "h-9 px-3.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
