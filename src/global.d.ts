// 全局类型定义:

type Percentage = `${number}%`;

interface messageType {
    info: (message: JointContent) => void;
    warn: (message: JointContent) => void;
    error: (message: JointContent) => void;
}