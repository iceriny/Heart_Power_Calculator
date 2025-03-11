import {
    Button,
    Card,
    Checkbox,
    ConfigProvider,
    Flex,
    InputNumber,
    Statistic,
    theme,
    Tooltip,
} from "antd";
import { QuestionCircleFilled } from "@ant-design/icons";
import { FC, useEffect, useState } from "react";
import LogoIcon from "./LogoIcon";
import {
    numberFormatterConsume,
    numberFormatterWithLogo,
} from "./NumberFormatter";

interface Props {
    sendMessage: messageType;
    style?: React.CSSProperties;
}
interface ConsumableItems {
    instance: number;
    boss: number;
    stronghold: number;
}
const { useToken } = theme;

// 定义各资源项的消耗系数
const coefficients = { instance: 60, boss: 20, stronghold: 20 };
// 根据优先级对资源项进行排序，确保强hold优先调整
const variables: (keyof ConsumableItems)[] = [
    "instance",
    "boss",
    "stronghold",
].sort((a, b) => {
    const priority = { instance: 2, boss: 1, stronghold: 0 };
    return (
        priority[b as keyof ConsumableItems] -
        priority[a as keyof ConsumableItems]
    );
}) as (keyof ConsumableItems)[];

/**
 * 计算消耗的核心函数，用于根据输入的参数计算资源分配。
 *
 * @param intelligent 是否启用智能分配模式。如果为 true，则优先分配副本，其次是镇守，最后是据点。
 * @param point 当前可用的心力值。
 * @param active 一个布尔数组，表示副本、镇守和据点是否激活。
 * @param itemName 当前调整的资源项名称（可选），为 null 表示不调整特定项。
 * @param consumableItems 当前的资源分配对象，包含副本、镇守和据点的数量。
 * @returns 返回一个新的资源分配对象，或者在无法满足条件时返回 null。
 */
function getConsumable(
    intelligent: boolean,
    point: number,
    active: [boolean, boolean, boolean],
    itemName: keyof ConsumableItems | null,
    consumableItems: ConsumableItems
): ConsumableItems | null {
    const result: ConsumableItems = { ...consumableItems };
    let consumption = point;
    let minCoefficients = 500;

    // 如果指定了调整的资源项，先扣除该项的消耗
    if (itemName !== null)
        point -= consumableItems[itemName] * coefficients[itemName];

    // 筛选出可调整的资源项
    const adjustableVariables = variables.filter((v) => {
        const _active = active[variables.indexOf(v)];
        if (!_active) result[v] = 0;
        return v !== itemName && _active;
    });

    if (intelligent) {
        // 智能分配模式：优先分配副本，其次是镇守，最后是据点
        minCoefficients = adjustableVariables.reduce(
            (acc, curr) => Math.min(acc, consumableItems[curr]),
            500
        );

        for (const [index, varName] of adjustableVariables.entries()) {
            if (point <= minCoefficients) {
                if (point < 0 && index !== 0) {
                    result[adjustableVariables[index - 1]]--;
                    point += coefficients[adjustableVariables[index - 1]];
                }
            }
            const coeff = coefficients[varName];
            const optimalValue = ~~(point / coeff);
            result[varName] = optimalValue;
            point -= optimalValue * coeff;
        }
    } else {
        // 非智能分配模式：直接扣除资源项的消耗
        if (itemName === null) return result;
        minCoefficients = adjustableVariables.reduce(
            (acc, curr) => Math.min(acc, consumableItems[curr]),
            500
        );
        for (const v of adjustableVariables) {
            point -= consumableItems[v] * coefficients[v];
        }

        while (point < 0 && itemName !== "instance") {
            result.instance--;
            point += coefficients.instance;
        }
    }

    // 验证最终的资源分配是否合法
    for (const variable of variables) {
        if (result[variable] < 0) return null;
        consumption -= result[variable] * coefficients[variable];
        if (consumption < 0 && itemName !== null) {
            return null;
        }
    }

    return result;
}

/**
 * 心力消耗模拟计算器组件。
 *
 * @param size 组件的宽度，通常是一个百分比值。
 * @param sendMessage 用于发送消息的回调函数，通常用于显示错误提示。
 * @returns 返回一个 React 组件，用于模拟心力的消耗和分配。
 */
const CalConsume: FC<Props> = ({ sendMessage, style }) => {
    const [point, setPoint] = useState(500); // 当前可用的心力值
    const [consumableItems, setConsumableItems] = useState<ConsumableItems>({
        instance: 8,
        boss: 1,
        stronghold: 0,
    }); // 当前的资源分配对象
    const [surplus, setSurplus] = useState(0); // 剩余的心力值
    const [active, setActive] = useState<[boolean, boolean, boolean]>([
        true,
        true,
        true,
    ]); // 资源项的激活状态
    const [intelligent, setIntelligent] = useState(false); // 是否启用智能分配模式

    /**
     * 计算资源分配的核心逻辑。
     *
     * @param value 用户输入的资源数量。
     * @param type 当前调整的资源项名称（可选）。
     */
    const cal = (value: number, type: keyof ConsumableItems | null) => {
        const new_consumableItems = {
            ...consumableItems,
        };
        if (type !== null) new_consumableItems[type] = value;

        const CalConsume = getConsumable(
            intelligent,
            point,
            active,
            type,
            new_consumableItems
        );
        if (CalConsume === null) {
            sendMessage.error("输入的值将超过设置的心力, 请调整心力值!");
            return;
        }
        setConsumableItems(CalConsume);
    };

    // 监听心力值和资源分配的变化，更新剩余心力值
    useEffect(() => {
        setSurplus(
            point -
                (consumableItems.instance * coefficients.instance +
                    consumableItems.boss * coefficients.boss +
                    consumableItems.stronghold * coefficients.stronghold)
        );
    }, [consumableItems, point]);

    const { colorTextTertiary, colorPrimary } = useToken().token;

    return (
        <ConfigProvider
            theme={{
                token: {
                    ...useToken().token,
                    colorBorderSecondary: colorPrimary,
                },
            }}
        >
            {/* 卡片标题，包含工具提示 */}
            <Card
                title={
                    <>
                        <span>消耗模拟计算器</span>
                        <Tooltip
                            placement="bottomLeft"
                            title={
                                <>
                                    此功能是为了计算: 如何使用心力
                                    <LogoIcon />.
                                    <br />
                                    心力栏是表示你将要使用的心力
                                    <LogoIcon />
                                    .
                                    <br />
                                    输入心力
                                    <LogoIcon />
                                    .后, 调整下方的不同项,
                                    来模拟如何消耗分配你的心力
                                    <LogoIcon />.
                                </>
                            }
                        >
                            <Button
                                type="link"
                                icon={<QuestionCircleFilled />}
                            />
                        </Tooltip>
                    </>
                }
                style={style}
            >
                {/* 主体内容 */}
                <Flex vertical gap="middle">
                    {/* 心力输入框 */}
                    <InputNumber
                        addonBefore="心力"
                        value={point}
                        style={{ width: "200px" }}
                        onChange={(value) => {
                            if (value !== null) {
                                setPoint(value);
                                cal(value, null);
                            }
                        }}
                        suffix={<LogoIcon size={1.5} />}
                    />
                    {/* 智能分配复选框 */}
                    <Tooltip title="当激活时, 会确保打更多的副本, 然后是尽量多的镇守, 最后才保证据点的数量.">
                        <Checkbox
                            checked={intelligent}
                            onChange={(e) => {
                                setIntelligent(e.target.checked);
                            }}
                            style={{ width: "6rem" }}
                        >
                            智能分配
                        </Checkbox>
                    </Tooltip>
                    <p>可用于: </p>
                    {/* 资源项输入框 */}
                    <Flex gap="middle" wrap>
                        {active[0] ? (
                            <InputNumber
                                addonBefore={
                                    <Flex gap={"small"} align="center">
                                        <Checkbox
                                            checked={active[0]}
                                            onChange={(e) => {
                                                setActive([
                                                    e.target.checked,
                                                    active[1],
                                                    active[2],
                                                ]);
                                            }}
                                        />
                                        副本:
                                    </Flex>
                                }
                                value={consumableItems.instance}
                                style={{ width: "250px" }}
                                onChange={(value) => {
                                    if (value !== null) {
                                        cal(value, "instance");
                                    }
                                }}
                                suffix={
                                    <span style={{ color: colorTextTertiary }}>
                                        次
                                    </span>
                                }
                                addonAfter={
                                    <span
                                        style={{
                                            color: colorTextTertiary,
                                        }}
                                    >
                                        <Statistic
                                            valueStyle={{
                                                fontSize: ".8rem",
                                                textAlign: "center",
                                                color: colorTextTertiary,
                                                width: "3rem",
                                            }}
                                            value={
                                                consumableItems.instance *
                                                coefficients.instance
                                            }
                                            formatter={numberFormatterConsume(
                                                1,
                                                colorTextTertiary
                                            )}
                                            style={{ display: "inline-block" }}
                                        />
                                    </span>
                                }
                            />
                        ) : (
                            <Flex gap={"small"} align="center">
                                <Checkbox
                                    checked={active[0]}
                                    onChange={(e) => {
                                        setActive([
                                            e.target.checked,
                                            active[1],
                                            active[2],
                                        ]);
                                    }}
                                />
                                副本:
                            </Flex>
                        )}
                        {active[1] ? (
                            <InputNumber
                                addonBefore={
                                    <Flex gap={"small"} align="center">
                                        <Checkbox
                                            checked={active[1]}
                                            onChange={(e) => {
                                                setActive([
                                                    active[0],
                                                    e.target.checked,
                                                    active[2],
                                                ]);
                                            }}
                                        />
                                        镇守:
                                    </Flex>
                                }
                                value={consumableItems.boss}
                                style={{ width: "250px" }}
                                onChange={(value) => {
                                    if (value !== null) {
                                        cal(value, "boss");
                                    }
                                }}
                                suffix={
                                    <span style={{ color: colorTextTertiary }}>
                                        次
                                    </span>
                                }
                                addonAfter={
                                    <span style={{ color: colorTextTertiary }}>
                                        <Statistic
                                            valueStyle={{
                                                fontSize: ".8rem",
                                                textAlign: "center",
                                                color: colorTextTertiary,
                                                width: "3rem",
                                            }}
                                            value={
                                                consumableItems.boss *
                                                coefficients.boss
                                            }
                                            formatter={numberFormatterConsume(
                                                1,
                                                colorTextTertiary
                                            )}
                                            style={{ display: "inline-block" }}
                                        />
                                    </span>
                                }
                            />
                        ) : (
                            <Flex gap={"small"} align="center">
                                <Checkbox
                                    checked={active[1]}
                                    onChange={(e) => {
                                        setActive([
                                            active[0],
                                            e.target.checked,
                                            active[2],
                                        ]);
                                    }}
                                />
                                镇守:
                            </Flex>
                        )}
                        {active[2] ? (
                            <InputNumber
                                addonBefore={
                                    <Flex gap={"small"} align="center">
                                        <Checkbox
                                            checked={active[2]}
                                            onChange={(e) => {
                                                setActive([
                                                    active[0],
                                                    active[1],
                                                    e.target.checked,
                                                ]);
                                            }}
                                        />
                                        据点:
                                    </Flex>
                                }
                                value={consumableItems.stronghold}
                                style={{ width: "250px" }}
                                onChange={(value) => {
                                    if (value !== null) {
                                        cal(value, "stronghold");
                                    }
                                }}
                                suffix={
                                    <span style={{ color: colorTextTertiary }}>
                                        次
                                    </span>
                                }
                                addonAfter={
                                    <span style={{ color: colorTextTertiary }}>
                                        <Statistic
                                            valueStyle={{
                                                fontSize: ".8rem",
                                                textAlign: "center",
                                                color: colorTextTertiary,
                                                width: "3rem",
                                            }}
                                            value={
                                                consumableItems.stronghold *
                                                coefficients.stronghold
                                            }
                                            formatter={numberFormatterConsume(
                                                1,
                                                colorTextTertiary
                                            )}
                                            style={{ display: "inline-block" }}
                                        />
                                    </span>
                                }
                            />
                        ) : (
                            <Flex gap={"small"} align="center">
                                <Checkbox
                                    checked={active[2]}
                                    onChange={(e) => {
                                        setActive([
                                            active[0],
                                            active[1],
                                            e.target.checked,
                                        ]);
                                    }}
                                />
                                据点:
                            </Flex>
                        )}
                    </Flex>
                    {/* 剩余心力显示 */}
                    <Statistic
                        style={{ display: "inline-block" }}
                        title="剩余:"
                        value={surplus}
                        formatter={numberFormatterWithLogo}
                    />
                </Flex>
            </Card>
        </ConfigProvider>
    );
};

export default CalConsume;
