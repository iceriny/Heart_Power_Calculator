import Logo from "./assets/logo.svg?react";
import Icon from "@ant-design/icons";
import type { GetProps } from "antd";

type CustomIconComponentProps = GetProps<typeof Icon> & {
    size?: number;
    color?: string;
};

const LogoIcon = ({
    size,
    color = "#B5A387",
    style,
    ...rest
}: Partial<CustomIconComponentProps>) => (
    <Icon
        component={Logo}
        style={{ ...style, fontSize: size ? `${size}rem` : undefined, color }}
        {...rest}
    />
);

export default LogoIcon;
