import {
    Button,
    Card,
    DatePicker,
    Flex,
    InputNumber,
    Statistic,
    Tooltip,
} from "antd";
import { FC, useCallback, useEffect, useState } from "react";
import LogoIcon from "./LogoIcon";

import { QuestionCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import { numberFormatterWithLogo } from "./NumberFormatter";
import { getNextMonday } from "./Utilities";
interface Props {
    currentPoint: number;
    targetTime: dayjs.Dayjs;
    onChangeCurrentPoint: (value: number) => void;
    onChangeTargetTime: (targetTime: dayjs.Dayjs) => void;

    style?: React.CSSProperties;
}

const CalConsumption: FC<Props> = ({
    currentPoint,
    targetTime,
    onChangeCurrentPoint,
    onChangeTargetTime,
    style,
}) => {
    const [targetPoint, setTargetPoint] = useState(500);

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
    return (
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
                                    是计算达到在目标时间时, 为了保证达到目标心力
                                    <LogoIcon />, 需要消耗或者恢复多少心力
                                    <LogoIcon />.
                                </p>
                            </>
                        }
                    >
                        <Button type="link" icon={<QuestionCircleFilled />} />
                    </Tooltip>
                </>
            }
            style={style}
        >
            <Flex vertical gap="middle">
                <InputNumber
                    addonBefore="输入当前心力"
                    defaultValue={currentPoint}
                    value={currentPoint}
                    style={{ width: "100%" }}
                    onChange={(value) => {
                        if (value !== null) {
                            onChangeCurrentPoint(value);
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
                        value={targetTime}
                        style={{ width: "100%" }}
                        showTime
                        showHour
                        showMinute
                        defaultValue={getNextMonday()}
                        format={"MM[月]DD[日] HH:mm"}
                        onChange={(value) => {
                            onChangeTargetTime(value);
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
    );
};

export default CalConsumption;
