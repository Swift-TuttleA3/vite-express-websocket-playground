import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Canvas from './canvas';

describe('Canvas Component', () => {
    let wsMock;
    let incrementClickCountMock;
    let setRectanglesMock;
    let setMongodbDataMock;

    beforeEach(() => {
        wsMock = {
            onmessage: jest.fn(),
            send: jest.fn(),
            readyState: WebSocket.OPEN,
        };
        incrementClickCountMock = jest.fn();
        setRectanglesMock = jest.fn();
        setMongodbDataMock = jest.fn();
    });

    test('renders Canvas component', () => {
        render(
            <Canvas
                ws={wsMock}
                selectedColor="red"
                incrementClickCount={incrementClickCountMock}
                rectangles={[]}
                setRectangles={setRectanglesMock}
                isConnected={true}
                currentUser={{ id: 'user1' }}
                setMongodbData={setMongodbDataMock}
            />
        );

        const canvasElement = screen.getByTestId('canvas');
        expect(canvasElement).toBeInTheDocument();
    });

    test('handles canvas click when connected', () => {
        render(
            <Canvas
                ws={wsMock}
                selectedColor="red"
                incrementClickCount={incrementClickCountMock}
                rectangles={[]}
                setRectangles={setRectanglesMock}
                isConnected={true}
                currentUser={{ id: 'user1' }}
                setMongodbData={setMongodbDataMock}
            />
        );

        const stage = screen.getByTestId('canvas').querySelector('canvas');
        fireEvent.click(stage, { clientX: 50, clientY: 50 });

        expect(setRectanglesMock).toHaveBeenCalled();
        expect(wsMock.send).toHaveBeenCalled();
        expect(incrementClickCountMock).toHaveBeenCalled();
        expect(setMongodbDataMock).toHaveBeenCalled();
    });

    test('does not handle canvas click when not connected', () => {
        render(
            <Canvas
                ws={wsMock}
                selectedColor="red"
                incrementClickCount={incrementClickCountMock}
                rectangles={[]}
                setRectangles={setRectanglesMock}
                isConnected={false}
                currentUser={{ id: 'user1' }}
                setMongodbData={setMongodbDataMock}
            />
        );

        const stage = screen.getByTestId('canvas').querySelector('canvas');
        fireEvent.click(stage, { clientX: 50, clientY: 50 });

        expect(setRectanglesMock).not.toHaveBeenCalled();
        expect(wsMock.send).not.toHaveBeenCalled();
        expect(incrementClickCountMock).not.toHaveBeenCalled();
        expect(setMongodbDataMock).not.toHaveBeenCalled();
    });

    test('handles WebSocket messages', () => {
        render(
            <Canvas
                ws={wsMock}
                selectedColor="red"
                incrementClickCount={incrementClickCountMock}
                rectangles={[]}
                setRectangles={setRectanglesMock}
                isConnected={true}
                currentUser={{ id: 'user1' }}
                setMongodbData={setMongodbDataMock}
            />
        );

        const messageEvent = new MessageEvent('message', {
            data: JSON.stringify({ type: 'userCount', count: 5 }),
        });
        wsMock.onmessage(messageEvent);

        expect(wsMock.onmessage).toHaveBeenCalled();
    });
});