import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  position: absolute;
  top: -63px;
  left: ;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 56px;
`;

const MenuList = styled.ul`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1px;
  width: 112px;
  height: 56px;
  background-color: #fff;
  border: 1px solid #dbdbdb;
  box-shadow: 0 2px 8px rgba(0 0 0 / 29.8%);
`;

const MenuItem = styled.li`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 54px;
  height: 52px;
`;

const MenuButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: transparent;
  border: none;
  box-shadow: none;
  cursor: pointer;

  &:focus {
    background-color: #e8e7e5;
  }
`;

const TabMenu = ({
  className,
  onAudio = () => {},
  onSelect = () => {},
  onCancel = () => {},
}) => {
  const audioButtonRef = useRef(null);
  const selectButtonRef = useRef(null);

  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    if (focusIndex) {
      selectButtonRef.current.focus();
    } else {
      audioButtonRef.current.focus();
    }
  }, [focusIndex]);

  /**
   * Handles keyboard controls within the TabMenu, which uses the
   * arrow keys to alternate between the available buttons and the Tab
   * and Escape keys to leave the TabMenu.
   * @param {event} e event object passed on by onkeydown
   */
  const handleKeyDown = (e) => {
    // Deconstruct the key from the event so that the event can be
    // used to cancel default behavior as necessary
    const { key } = e;
    switch (key) {
      case 'Tab':
      case 'Escape': {
        // If the element is tabbed away from (including a Shift+Tab),
        // then the menu should be hidden. Pass the key to the callback
        // so the concerned Components can get the context of how the
        // menu was left
        onCancel(key);
        break;
      }
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowDown':
      case 'ArrowRight': {
        // Prevent the default so users that are zoomed in aren't
        // flung all over the place by this default behavior while
        // trying to use the Draggable
        e.preventDefault();
        setFocusIndex(focusIndex ? 0 : 1);

        break;
      }
      default:
        break;
    }
  };

  return (
    <Container className={className}>
      <MenuList>
        <MenuItem>
          <MenuButton
            ref={audioButtonRef}
            tabIndex="-1"
            onClick={onAudio}
            onKeyDown={handleKeyDown}
            aria-label="Hear this answer"
            draggable="false"
          >
            <svg
              width="30"
              height="25"
              viewBox="0 0 30 25"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* eslint-disable max-len */}
              <path
                opacity="0.8"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.15319 7.19523L15.8075 0.0982892C16.0432 -0.0749249 16.3669 -0.0131927 16.5305 0.236172C16.591 0.328253 16.6234 0.437688 16.6234 0.549804V23.736C16.6234 24.0396 16.3908 24.2857 16.1039 24.2857C15.9979 24.2857 15.8945 24.2514 15.8075 24.1875L6.15488 17.0908H1.03896C0.465159 17.0908 0 16.5985 0 15.9913V8.29474C0 7.68749 0.465159 7.19523 1.03896 7.19523H6.15319ZM22.1702 2.46963C21.7246 2.06919 21.6703 1.36246 22.0488 0.891107C22.4273 0.419749 23.0953 0.362254 23.5408 0.762688C26.7137 3.61447 28.5714 7.72436 28.5714 12.1429C28.5714 16.5615 26.7137 20.6714 23.5408 23.5232C23.0953 23.9236 22.4273 23.8661 22.0488 23.3947C21.6703 22.9234 21.7246 22.2167 22.1702 21.8162C24.8769 19.3834 26.4544 15.8935 26.4544 12.1429C26.4544 8.39239 24.8769 4.90243 22.1702 2.46963ZM20.5942 19.924C20.1568 20.3343 19.4878 20.2919 19.0999 19.8291C18.712 19.3664 18.7522 18.6586 19.1896 18.2482C20.839 16.7007 21.7972 14.5034 21.7972 12.1429C21.7972 9.78242 20.839 7.58514 19.1896 6.0376C18.7522 5.62724 18.712 4.91945 19.0999 4.45671C19.4878 3.99397 20.1568 3.95151 20.5942 4.36187C22.6913 6.32941 23.9142 9.13378 23.9142 12.1429C23.9142 15.1521 22.6913 17.9564 20.5942 19.924Z"
                fill="black"
              />
              {/* eslint-enable */}
            </svg>
          </MenuButton>
        </MenuItem>
        <MenuItem>
          <MenuButton
            ref={selectButtonRef}
            tabIndex="-1"
            onClick={onSelect}
            onKeyDown={handleKeyDown}
            aria-label="Pick this answer"
            draggable="false"
          >
            <svg
              width="35"
              height="28"
              viewBox="0 0 35 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 14.6176L11.268 24L33 2"
                stroke="black"
                strokeWidth="5"
              />
            </svg>
          </MenuButton>
        </MenuItem>
      </MenuList>
    </Container>
  );
};

TabMenu.propTypes = {
  className: PropTypes.string,
  onAudio: PropTypes.func,
  onSelect: PropTypes.func,
  onCancel: PropTypes.func,
};

TabMenu.defaultProps = {
  className: '',
  onAudio: () => {},
  onSelect: () => {},
  onCancel: () => {},
};

export default TabMenu;
