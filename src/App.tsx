import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider, Flex, Col, Row, theme, message } from "antd";

import locale from "antd/locale/zh_CN";
import dayjs from "dayjs";

import "dayjs/locale/zh-cn";
import { useCallback, useState } from "react";
import CalConsumption from "./CalConsumption";
import CalRecoveryPoint from "./CalRecoveryPoint";
import CalUpperLimit from "./CalUpperLimit";
import {
    breakpointComparative,
    getNextMonday,
    getValueFromBreakpoint,
    useBreakpoint,
} from "./Utilities";
import CalConsume from "./CalConsume";

import "./assets/App.css";
import { JointContent } from "antd/es/message/interface";

dayjs.locale("zh-cn");

const CardStyle: React.CSSProperties = {
    boxShadow: "0 0 100px rgba(0, 0, 0, 0.5)",
};

const App = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const info = useCallback(
        (message: JointContent) => {
            messageApi.info(message);
        },
        [messageApi]
    );
    const warn = useCallback(
        (message: JointContent) => {
            messageApi.warning(message);
        },
        [messageApi]
    );
    const error = useCallback(
        (message: JointContent) => {
            messageApi.error(message);
        },
        [messageApi]
    );

    const sendMessage: messageType = {
        info,
        warn,
        error,
    };

    const screens = useBreakpoint();
    const size: Percentage = getValueFromBreakpoint(
        {
            xs: "90%" as const,
            sm: "80%" as const,
            md: "60%" as const,
            lg: "65%" as const,
            xl: "50%" as const,
            xxl: "50%" as const,
        },
        screens
    );

    const [currentPoint, setCurrentPoint] = useState(100);
    const [targetTime, setTargetTime] = useState(getNextMonday());

    CardStyle.width = size;

    return (
        <ConfigProvider
            locale={locale}
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    // Seed Token，影响范围大
                    colorPrimary: "#a88956",
                    colorLink: "#a88956",
                    borderRadius: 20,
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
            {contextHolder}
            <div className="App">
                <Row gutter={[0, 24]}>
                    <Col span={breakpointComparative(screens, "lg") ? 12 : 24}>
                        <Flex
                            vertical
                            justify="center"
                            align="center"
                            gap="large"
                        >
                            <CalRecoveryPoint
                                style={CardStyle}
                                targetTime={targetTime}
                                onChangeTargetTime={(v) => setTargetTime(v)}
                            />
                            <CalUpperLimit
                                style={CardStyle}
                                currentPoint={currentPoint}
                                onChangeCurrentPoint={(v) => setCurrentPoint(v)}
                            />
                            <CalConsumption
                                style={CardStyle}
                                currentPoint={currentPoint}
                                targetTime={targetTime}
                                onChangeCurrentPoint={(v) => setCurrentPoint(v)}
                                onChangeTargetTime={(v) => setTargetTime(v)}
                            />
                        </Flex>
                    </Col>
                    <Col span={breakpointComparative(screens, "lg") ? 12 : 24}>
                        <Flex
                            vertical
                            justify="center"
                            align="center"
                            gap="large"
                        >
                            <CalConsume
                                style={{
                                    ...CardStyle,
                                    width: getValueFromBreakpoint(
                                        {
                                            xs: "90%" as const,
                                            sm: "80%" as const,
                                            md: "60%" as const,
                                            lg: "65%" as const,
                                            xl: "90%" as const,
                                            xxl: "90%" as const,
                                        },
                                        screens
                                    ),
                                }}
                                sendMessage={sendMessage}
                            />
                        </Flex>
                    </Col>
                </Row>
            </div>
        </ConfigProvider>
    );
};

export default App;
