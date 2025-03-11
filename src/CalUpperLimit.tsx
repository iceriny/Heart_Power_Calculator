import {
    Button,
    Card,
    Flex,
    InputNumber,
    Space,
    Statistic,
    Tooltip,
} from "antd";
import LogoIcon from "./LogoIcon";

import { QuestionCircleFilled } from "@ant-design/icons";
import { FC, useCallback } from "react";
import { numberFormatter } from "./NumberFormatter";

import dayjs from "dayjs";
interface Props {
    currentPoint: number;
    onChangeCurrentPoint: (currentPoint: number) => void;

    style?: React.CSSProperties;
}
const CalUpperLimit: FC<Props> = ({
    style,
    currentPoint,
    onChangeCurrentPoint,
}) => {
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
        <Card
            title={
                <>
                    <span>上限时间计算</span>
                    <Tooltip
                        placement="bottomLeft"
                        title={
                            <>
                                在输入了当前心力后, 自动计算到什么时候, 达到心力
                                <LogoIcon />
                                上限.
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
                <Tooltip title="达到上限的时间" placement="bottom">
                    {calculateLimitTime()}
                </Tooltip>
            </Flex>
        </Card>
    );
};

export default CalUpperLimit;
