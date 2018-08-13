// @flow
import React, { Component } from 'react';
import styled from 'styled-components';

type Props = {
  size: 'small' | 'medium' | 'large',
  grayscale: boolean,
};

class Logo extends Component<Props> {
  render() {
    const { size, grayscale } = this.props;

    return (
      <LogoElem size={size} grayscale={grayscale}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={getSize(size)}
          height={getSize(size)}
          viewBox="0 0 200 200"
        >
          <defs>
            <linearGradient
              id="a"
              x1="43.792789%"
              x2="50%"
              y1="17.771226%"
              y2="50%"
            >
              <stop offset="0%" stopColor="#FDCF27" />
              <stop offset="100%" stopColor="#FCC313" />
            </linearGradient>
            <linearGradient id="b" x1="0%" y1="50%" y2="46.174222%">
              <stop offset="0%" stopColor="#E8AB78" />
              <stop offset="100%" stopColor="#9B7251" />
            </linearGradient>
            <linearGradient
              id="c"
              x1="58.799803%"
              x2="88.912857%"
              y1="20.805025%"
              y2="45.076329%"
            >
              <stop offset="0%" stopOpacity=".367301" />
              <stop offset="100%" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g fill="none" fillRule="evenodd">
            <path
              fill="#5E4022"
              fillRule="nonzero"
              d="M24 70l76-35.5L176 70l-76 35.5z"
            />
            <path
              fill="#FAB882"
              fillRule="nonzero"
              d="M0 40l24 30 76-35.5-26.5-25z"
            />
            <path
              fill="#DEA373"
              fillRule="nonzero"
              d="M100 34.5l26.5-25L200 40l-24 30z"
            />
            <path fill="#FDCD21" fillRule="nonzero" d="M100 20l40 54H60z" />
            <path fill="#FDAD00" fillRule="nonzero" d="M100 20l40 54 30-23z" />
            <path
              fill="#EA6C00"
              fillRule="nonzero"
              d="M100 20l70 31-28-24.5z"
            />
            <path fill="#FEEEB7" fillRule="nonzero" d="M100 20L60 74 30 51z" />
            <path
              fill="url(#a)"
              fillRule="nonzero"
              d="M100 20L30 51l28-24.5z"
            />
            <path fill="#FDAD00" fillRule="nonzero" d="M30 51l70 111-40-88z" />
            <path fill="#EA6C00" fillRule="nonzero" d="M60 74l40 88 40-88z" />
            <path
              fill="#C45800"
              fillRule="nonzero"
              d="M170 51l-70 111 40-88z"
            />
            <path
              fill="#7B542C"
              fillRule="nonzero"
              d="M100 105.5v88l76-33.5V70z"
            />
            <path
              fill="#BF8D63"
              fillRule="nonzero"
              d="M100 105.5v88L24 160V70z"
            />
            <path
              fill="#FFF"
              fillRule="nonzero"
              d="M95.583137 137.749803v-21.504316l-22.470252-10.5135v21.320926z"
            />
            <text
              fill="#000"
              fontFamily="ArialMT, Arial"
              fontSize="4"
              letterSpacing=".036111"
              transform="rotate(27 88.444982 124.646516)"
            >
              <tspan x="79.444982" y="121.146516">
                Skpm
              </tspan>{' '}
              <tspan x="79.444982" y="126.146516">
                caution
              </tspan>{' '}
              <tspan x="79.444982" y="131.146516">
                awesome
              </tspan>
            </text>
            <path
              fill="url(#b)"
              fillRule="nonzero"
              d="M100 105.5l24 30 76-35.5-24-30z"
            />
            <path
              fill="#EDAF7B"
              fillRule="nonzero"
              d="M100 105.5l-24 30L0 100l24-30z"
            />
            <path
              fill="url(#c)"
              fillRule="nonzero"
              d="M75.995237 135.5L100 120.988495V105.5z"
            />
            <path
              fill="#593D20"
              fillRule="nonzero"
              stroke="#593C20"
              strokeLinecap="round"
              d="M140.270809 150.44296c-.480055 3.284053 9.728569 14.730278 13.609377-5.684302l-9.008983 3.626645c.346701 2.438819 1.081466 4.075871 2.204295 4.911155-1.437081-.298345-3.099917.334518-4.598314-3.681222l-2.206375.827724zM147.5 156.5v9-9zm-3 11l6-3-6 3z"
            />
            <path
              stroke="#593D20"
              strokeLinecap="square"
              d="M158.5 161.5l13-6"
            />
            <path
              fill="#593D20"
              fillRule="nonzero"
              d="M160.647283 141.401846l-2.503841 4.649816 4.868867-1.729228zM168.503841 137L166 141.649816l4.868868-1.729228zM161.967637 146.757449v11.025756l-1.929934.661429v-10.861945zM169.974606 142.5v11.025756l-1.929933.661429V143.32524z"
            />
          </g>
        </svg>
      </LogoElem>
    );
  }
}

const getSize = size => {
  switch (size) {
    case 'small':
      return 24;
    default:
    case 'medium':
      return 75;
    case 'large':
      return 96;
  }
};

const LogoElem = styled.div`
  filter: grayscale(${props => (props.grayscale ? '90%' : '0%')});
  cursor: default;
`;

export default Logo;
