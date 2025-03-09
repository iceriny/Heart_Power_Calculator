import type { Breakpoint } from "antd";
import { Grid } from "antd";

// 使用 Ant Design 的断点工具
const { useBreakpoint: useAntdBreakpoint } = Grid;

// 定义断点类型的别名
type BreakpointTypes = Partial<Record<Breakpoint, boolean>>;

/**
 * 自定义 Hook 用于获取当前屏幕断点
 * @returns 当前屏幕断点对象
 */
function useBreakpoint() {
    const screens = useAntdBreakpoint();
    return screens;
}

// 定义断点列表常量，按照屏幕大小降序排列
const BREAK_POINT_LIST = ["xxl", "xl", "lg", "md", "sm", "xs"] as const;

/**
 * 获取当前有效的断点
 * @param breakpoints 屏幕断点对象
 * @returns 当前有效的断点字符串
 */
function getCurrentBreakpoint(breakpoints: BreakpointTypes) {
    for (const breakpoint of BREAK_POINT_LIST) {
        if (breakpoints[breakpoint]) {
            return breakpoint;
        }
    }
    return "xs";
}

/**
 * 比较断点是否有效
 * @param breakpoints 屏幕断点对象
 * @param value 要比较的断点值
 * @returns 如果断点有效返回 true，否则返回 false
 */
function breakpointComparative(
    breakpoints: BreakpointTypes,
    value: Breakpoint
) {
    if (breakpoints[value]) return true;
    return false;
}

/**
 * 根据断点获取对应的值
 * @param values 值对象，每个断点对应一个值
 * @param breakpoints 屏幕断点对象或单一断点值
 * @param defaultValue 默认值，如果断点没有匹配则返回
 * @returns 对应断点的值
 */
function getValueFromBreakpoint<T extends Record<Breakpoint, unknown>>(
    values: T,
    breakpoints: BreakpointTypes,
    defaultValue?: T[keyof T]
): T[keyof T];

function getValueFromBreakpoint<T extends Record<Breakpoint, unknown>>(
    values: T,
    breakpoint: Breakpoint,
    defaultValue?: T[keyof T]
): T[keyof T];

function getValueFromBreakpoint<T extends Record<Breakpoint, unknown>>(
    values: T,
    breakpoints: BreakpointTypes | Breakpoint,
    defaultValue?: T[keyof T]
) {
    if (typeof breakpoints === "string") {
        return values[breakpoints] ?? defaultValue ?? values.md;
    } else {
        const currentBreakpoint = getCurrentBreakpoint(breakpoints);
        return values[currentBreakpoint] ?? defaultValue ?? values.md;
    }
}

// 导出模块函数供外部使用
export {
    useBreakpoint,
    getCurrentBreakpoint,
    breakpointComparative,
    getValueFromBreakpoint,
};
