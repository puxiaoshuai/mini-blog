"use client";

import { setup } from "@locator/runtime";
import { useEffect } from "react";

/**
 * 开发期工具：LocatorJS 运行时。配合 next.config 里的
 * @locator/webpack-loader（编译期注入 data-locatorjs），
 * 实现 Option+Click 页面组件直接跳转到 VS Code 源码。
 * 生产构建不挂载。
 */
export default function LocatorSetup() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setup();
    }
  }, []);
  return null;
}
