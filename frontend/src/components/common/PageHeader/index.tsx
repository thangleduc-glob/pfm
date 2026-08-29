/**
 * Reusable page header for list/detail screens.
 */

import React from "react";
import "./PageHeader.css";

interface PageHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  actionClassName?: string;
  titleClassName?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  actionLabel,
  onAction,
  actionDisabled = false,
  actionClassName,
  titleClassName,
}) => {
  if (!actionLabel && !onAction) {
    return (
      <header className="page-header">
        <h2 className={`page-header__title ${titleClassName || ""}`.trim()}>
          {title}
        </h2>
      </header>
    );
  }

  return (
    <header className="page-header">
      <h2 className={`page-header__title ${titleClassName || ""}`.trim()}>
        {title}
      </h2>
      {actionLabel && (
        <button
          type="button"
          className={`page-header__action ${actionClassName || ""}`.trim()}
          onClick={onAction}
          disabled={actionDisabled}
        >
          {actionLabel}
        </button>
      )}
    </header>
  );
};

export default PageHeader;
