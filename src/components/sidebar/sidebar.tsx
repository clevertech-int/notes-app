import { PropsWithChildren, useEffect, useState } from 'react';
import { Button, Col, Row, Tooltip } from 'antd';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarRightCollapse } from '@tabler/icons-react';
import styles from './sidebar.module.less';

export interface SidebarProps extends PropsWithChildren {
  id: string;
  title: string;
  side: 'left' | 'right';
}

export function Sidebar({ id, title, side, children }: SidebarProps) {
  const [opened, setOpened] = useState(true);

  useEffect(() => {
    const defaultValue = localStorage.getItem(`siderbar-${id}`);
    if (defaultValue) {
      setOpened(defaultValue === 'true');
    }
  }, [id]);

  const handleSidebarCollapse = () => {
    localStorage.setItem(`siderbar-${id}`, `${!opened}`);
    setOpened(!opened);
  };

  const OpenedIcon =
    side === 'left' ? IconLayoutSidebarLeftCollapse : IconLayoutSidebarRightCollapse;
  const ClosedIcon =
    side === 'left' ? IconLayoutSidebarRightCollapse : IconLayoutSidebarLeftCollapse;

  const width = opened ? 310 : 82;

  return (
    <Col id={id} style={{ width, minWidth: width }}>
      <div className={styles.section}>
        <Row justify="space-between" align="middle" wrap={false}>
          <h3>{title}</h3>
          <Tooltip
            title={!opened && `Open ${title.toLowerCase()}`}
            placement={side === 'left' ? 'right' : 'left'}
          >
            <Button type="link" onClick={handleSidebarCollapse}>
              {opened ? <OpenedIcon /> : <ClosedIcon />}
            </Button>
          </Tooltip>
        </Row>
        {opened && children}
      </div>
    </Col>
  );
}

export default Sidebar;
