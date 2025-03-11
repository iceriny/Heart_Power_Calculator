import CountUp from "react-countup";
import LogoIcon from "./LogoIcon";

import type { StatisticProps } from "antd";
const numberFormatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} separator="," />
);
const numberFormatterWithLogo: StatisticProps["formatter"] = (value) => (
    <span>
        <CountUp end={value as number} separator="," />
        <LogoIcon style={{ marginLeft: "0.5rem" }} size={1.5} />
    </span>
);

const numberFormatterCache: {
    [key: `${string}_${number}`]: StatisticProps["formatter"];
} = {};

const numberFormatterConsume: (
    logoSize: number,
    logoColor?: string
) => StatisticProps["formatter"] = (logoSize, logoColor) => {
    const key = `${logoColor}_${logoSize}` as const;
    if (numberFormatterCache[key]) return numberFormatterCache[key];
    return (value) => (
        <span>
            <CountUp end={value as number} separator="," />
            <LogoIcon
                style={{ marginLeft: "0.5rem" }}
                size={logoSize}
                color={logoColor}
            />
        </span>
    );
};

export { numberFormatter, numberFormatterWithLogo, numberFormatterConsume };
