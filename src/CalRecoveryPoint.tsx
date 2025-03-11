import { Button, Card, DatePicker, Flex, Statistic, Tooltip } from "antd";
import { FC, useState } from "react";

import { QuestionCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import LogoIcon from "./LogoIcon";
import { numberFormatterWithLogo } from "./NumberFormatter";
import { getNextMonday } from "./Utilities";

function calculateRecovery(...dates: [dayjs.Dayjs, dayjs.Dayjs]) {
    const [start, end] = dates;
    const range = end.diff(start, "minute");
    return Math.floor(range / 9);
}

interface Props {
    targetTime: dayjs.Dayjs;
    onChangeTargetTime: (targetTime: dayjs.Dayjs) => void;
    style?: React.CSSProperties;
}

const CalRecoveryPoint: FC<Props> = ({
    targetTime,
    onChangeTargetTime,
    style,
}) => {
    const [recoveryPoint, setRecoveryPoint] = useState(
        calculateRecovery(dayjs(), getNextMonday())
    );
    const [currentTime, setCurrentTime] = useState(dayjs());
    return (
        <Card
            title={
                <>
                    <span>恢复量计算</span>
                    <Tooltip
                        placement="bottomLeft"
                        title={
                            <>
                                此功能是为了计算: 所选时间段内能够恢复多少的心力
                                <LogoIcon />.
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
                <DatePicker.RangePicker
                    showTime
                    showNow
                    showHour
                    showMinute
                    defaultValue={[dayjs(), getNextMonday()]}
                    value={[currentTime, targetTime]}
                    format={"MM[月]DD[日] HH:mm"}
                    onChange={(dates) => {
                        setCurrentTime(dates?.[0] as dayjs.Dayjs);
                        onChangeTargetTime(dates?.[1] as dayjs.Dayjs);
                        setRecoveryPoint(
                            calculateRecovery(
                                ...(dates as [dayjs.Dayjs, dayjs.Dayjs])
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
    );
};

export default CalRecoveryPoint;
