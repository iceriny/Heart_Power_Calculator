import Logo from "./assets/logo.svg?react";
import Icon from "@ant-design/icons";
import type { GetProps } from "antd";

type CustomIconComponentProps = GetProps<typeof Icon> & { size?: number };

const LogoIcon = ({
    size,
    style,
    ...rest
}: Partial<CustomIconComponentProps>) => (
    <Icon
        component={Logo}
        style={{ ...style, fontSize: size ? `${size}rem` : undefined }}
        {...rest}
    />
);

export default LogoIcon;
