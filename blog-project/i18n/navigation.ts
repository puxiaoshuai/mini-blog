import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** 前台内部链接统一走此实例：自动带 /zh、/en 前缀，usePathname 返回去前缀路径 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
