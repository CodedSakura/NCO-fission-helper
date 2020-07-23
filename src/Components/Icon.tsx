import React from 'react';
import {classMap} from "../Utils/utils";

import "../Style/Icon.scss";

export enum Icons {
  Close, Minimise,
  Docked, Floating, Windowed
}

const iconMap: {[x in Icons]: {viewBox: string, data: React.ReactNode}} = {
  [Icons.Close]:    {viewBox: "0 0 8 8", data: <path d="M1 1L7 7M1 7L7 1"/>},//"M0 1L1 0,12 11,11 12ZM1 12L0 11,11 0,12 1Z"/>},
  [Icons.Minimise]: {viewBox: "0 0 8 8", data: <path d="M1 7H7"/>},//M0 10.6L12 10.6,12 12,0 12Z"/>},
  [Icons.Docked]:   {viewBox: "0 0 8 8", data: <><rect width={4} height={4} fill="#fff5" stroke="none"/><path d="M4 0V8V4H0"/></>},//M0 0L5 0,5 12,4 12,4 6,0 6Z"/>},
  [Icons.Floating]: {viewBox: "0 0 8 8", data: <path d=""/>},//M3 3H9V9H3Z"/>},
  [Icons.Windowed]: {viewBox: "0 0 8 8", data: <path d=""/>},//M2 5h5v4h-5Z"/>}
}

interface IconProps {
  name: Icons,
  onClick?(e: React.MouseEvent): any,
  className?: string,
  [x: string]: any
}

export const Icon = ({onClick, name, className, ...rest}: IconProps) => {
  const icon = <svg className={"ico"} viewBox={iconMap[name].viewBox}>{iconMap[name].data}</svg>;
  return <span {...rest} className={classMap("icon", className)}>
    {onClick ? <span onClick={onClick}>{icon}</span> : icon}
  </span>;
};