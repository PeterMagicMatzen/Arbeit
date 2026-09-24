// Stand-ins for the `relume-icons` package, backed by lucide-react (already in Base44 apps).
import {
  ChevronRight as LucideChevronRight,
  ChevronDown,
  CirclePlay,
  X,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

const withDefaults = (Icon) => {
  const Wrapped = ({ className, ...props }) => (
    <Icon className={className ?? "size-6"} strokeWidth={1.75} {...props} />
  );
  Wrapped.displayName = Icon.displayName;
  return Wrapped;
};

export const ChevronRight = withDefaults(LucideChevronRight);
export const KeyboardArrowDown = withDefaults(ChevronDown);
export const PlayCircle = withDefaults(CirclePlay);
export const Close = withDefaults(X);
export const ProgressActivity = withDefaults(LoaderCircle);
export const RelumeIcon = withDefaults(Sparkles);
