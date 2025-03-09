import "@ant-design/v5-patch-for-react-19";
import type { StatisticProps } from "antd";
import {
    Button,
    Card,
    ConfigProvider,
    DatePicker,
    Flex,
    InputNumber,
    Space,
    Statistic,
    theme,
    Tooltip,
} from "antd";
import { QuestionCircleFilled } from "@ant-design/icons";
import CountUp from "react-countup";

import locale from "antd/locale/zh_CN";
import dayjs from "dayjs";

import "dayjs/locale/zh-cn";
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import LogoIcon from "./LogoIcon";
import { getValueFromBreakpoint, useBreakpoint } from "./Utilities";

dayjs.locale("zh-cn");

const numberFormatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} separator="," />
);
const numberFormatterWithLogo: StatisticProps["formatter"] = (value) => (
    <span>
        <CountUp end={value as number} separator="," />
        <LogoIcon style={{ marginLeft: "0.5rem" }} size={1.5} />
    </span>
);

function calculateRecoveryPoint(...dates: [dayjs.Dayjs, dayjs.Dayjs]) {
    const [start, end] = dates;
    const range = end.diff(start, "minute");
    return Math.floor(range / 9);
}
function getNextMonday(currentDate: dayjs.Dayjs = dayjs()) {
    return currentDate
        .add(1, "week")
        .startOf("week")
        .add(1, "day")
        .add(10, "hour");
}
const App = () => {
    const screens = useBreakpoint();
    const size = getValueFromBreakpoint(
        {
            xs: "90%",
            sm: "80%",
            md: "60%",
            lg: "40%",
            xl: "40%",
            xxl: "30%",
        },
        screens
    );
    const [recoveryPoint, setRecoveryPoint] = useState(
        calculateRecoveryPoint(dayjs(), getNextMonday())
    );
    const [currentPoint, setCurrentPoint] = useState(100);
    const [targetPoint, setTargetPoint] = useState(500);
    const [targetTime, setTargetTime] = useState<dayjs.Dayjs>(getNextMonday());

    const calculateConsumption = useCallback(() => {
        const minutes = targetTime.diff(dayjs(), "minute");
        const recovery = Math.floor(minutes / 9);
        const consumption = currentPoint + recovery - targetPoint;
        return consumption;
    }, [currentPoint, targetPoint, targetTime]);
    const [consumption, setConsumption] = useState(calculateConsumption);

    useEffect(() => {
        setConsumption(calculateConsumption());
    }, [calculateConsumption]);

    const calculateLimitTime = useCallback(() => {
        const needed = 500 - currentPoint;
        const minutesNeeded = needed * 9;
        const targetTimes = dayjs().add(minutesNeeded, "minute");

        return (
            <Space>
                <Statistic
                    formatter={numberFormatter}
                    value={targetTimes.month() + 1}
                />
                月
                <Statistic
                    formatter={numberFormatter}
                    value={targetTimes.date()}
                />
                日
                <Statistic
                    formatter={numberFormatter}
                    value={targetTimes.hour()}
                />
                :
                <Statistic
                    formatter={numberFormatter}
                    value={targetTimes.minute()}
                />
            </Space>
        );
    }, [currentPoint]);

    return (
        <ConfigProvider
            locale={locale}
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    // Seed Token，影响范围大
                    colorPrimary: "#a88956",
                    colorLink: "#a88956",
                    borderRadius: 1,
                    colorBorder: "#505050",
                    colorTextBase: "#cbcbcb",

                    // 派生变量，影响范围小
                    colorBgContainer: "#262322",

                    controlOutline: "#505050",
                    controlTmpOutline: "#a88956",
                    colorBgElevated: "#262322",
                },
            }}
        >
            <Flex
                vertical
                justify="center"
                align="center"
                gap="large"
                style={{ minHeight: "100vh" }}
            >
                <Card
                    title={
                        <>
                            <span>恢复量计算</span>
                            <Tooltip
                                placement="bottomLeft"
                                title={
                                    <>
                                        此功能是为了计算:
                                        所选时间段内能够恢复多少的心力
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
                    style={{ width: size }}
                >
                    <Flex vertical gap="middle">
                        <DatePicker.RangePicker
                            showTime
                            showNow
                            showHour
                            showMinute
                            defaultValue={[dayjs(), getNextMonday()]}
                            format={"MM[月]DD[日] HH:mm"}
                            onChange={(dates) => {
                                setRecoveryPoint(
                                    Math.floor(
                                        calculateRecoveryPoint(
                                            ...(dates as [
                                                dayjs.Dayjs,
                                                dayjs.Dayjs
                                            ])
                                        )
                                    )
                                );
                            }}
                        />
                        <span>
                            <Statistic
                                title="将会恢复:"
                                value={recoveryPoint}
                                formatter={numberFormatterWithLogo}
                                style={{ display: "inline-block" }}
                            />
                        </span>
                    </Flex>
                </Card>
                <Card
                    title={
                        <>
                            <span>上限时间计算</span>
                            <Tooltip
                                placement="bottomLeft"
                                title={
                                    <>
                                        在输入了当前心力后, 自动计算到什么时候,
                                        达到心力
                                        <LogoIcon />
                                        上限.
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
                    style={{ width: size }}
                >
                    <Flex vertical gap="middle">
                        <InputNumber
                            addonBefore="输入当前心力"
                            defaultValue={currentPoint}
                            value={currentPoint}
                            style={{ width: "100%" }}
                            onChange={(value) => {
                                if (value !== null) {
                                    setCurrentPoint(value);
                                }
                            }}
                            suffix={<LogoIcon size={1.5} />}
                        />
                        <Tooltip title="达到上限的时间" placement="bottom">
                            {calculateLimitTime()}
                        </Tooltip>
                    </Flex>
                </Card>
                <Card
                    title={
                        <>
                            <span>消耗量计算</span>
                            <Tooltip
                                placement="bottomLeft"
                                title={
                                    <>
                                        <p>
                                            此卡片有三个位置需要输入, 当前心力
                                            <LogoIcon />, 目标心力
                                            <LogoIcon />, 目标时间
                                        </p>
                                        <p>
                                            是计算达到在目标时间时,
                                            为了保证达到目标心力
                                            <LogoIcon />,
                                            需要消耗或者恢复多少心力
                                            <LogoIcon />.
                                        </p>
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
                    style={{ width: size }}
                >
                    <Flex vertical gap="middle">
                        <InputNumber
                            addonBefore="输入当前心力"
                            defaultValue={currentPoint}
                            value={currentPoint}
                            style={{ width: "100%" }}
                            onChange={(value) => {
                                if (value !== null) {
                                    setCurrentPoint(value);
                                }
                            }}
                            suffix={<LogoIcon size={1.5} />}
                        />

                        <InputNumber
                            addonBefore="输入目标心力"
                            defaultValue={500}
                            style={{ width: "100%" }}
                            onChange={(value) => {
                                if (value !== null) {
                                    setTargetPoint(value);
                                }
                            }}
                            suffix={<LogoIcon size={1.5} />}
                        />

                        <Tooltip title="目标时间" placement="bottom">
                            <DatePicker
                                style={{ width: "100%" }}
                                showTime
                                showHour
                                showMinute
                                defaultValue={getNextMonday()}
                                format={"MM[月]DD[日] HH:mm"}
                                onChange={(value) => {
                                    setTargetTime(value);
                                }}
                            />
                        </Tooltip>

                        <Tooltip
                            placement="bottom"
                            title="需要消耗或恢复多少心力, 负值是需要补充的心力, 正值为需要消耗的心力."
                        >
                            <span>
                                <Statistic
                                    style={{ display: "inline-block" }}
                                    title="按当前数据, 需要消耗以下点心力:"
                                    value={consumption}
                                    formatter={numberFormatterWithLogo}
                                />
                            </span>
                        </Tooltip>
                    </Flex>
                </Card>
            </Flex>
        </ConfigProvider>
    );
};

export default App;
