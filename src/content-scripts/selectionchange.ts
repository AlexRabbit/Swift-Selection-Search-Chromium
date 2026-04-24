// Original script by Jared Jacobs, located at github.com/2is10/selectionchange-polyfill
// License: http://unlicense.org
// Adapted for Swift Selection Search by Daniel Lobo.

namespace selectionchange
{
	const MAC = /^Mac/.test(navigator.platform);
	const MAC_MOVE_KEYS = new Set([65, 66, 69, 70, 78, 80]); // A, B, E, F, P, N from support.apple.com/en-ie/HT201236
	export const modifierKey = MAC ? "metaKey" : "ctrlKey";

	let ranges = null;
	let nativeSelectionDebounceTimer: ReturnType<typeof setTimeout> | null = null;

	export function start() {
		ranges = getSelectedRanges();
		document.addEventListener("input", onInput, true);
		document.addEventListener("keydown", onKeyDown, true);
		document.addEventListener("mouseup", onMouseUp, true);
		document.addEventListener("selectionchange", onNativeSelectionChange, true);
	}

	export function stop() {
		ranges = null;
		if (nativeSelectionDebounceTimer !== null) {
			clearTimeout(nativeSelectionDebounceTimer);
			nativeSelectionDebounceTimer = null;
		}
		document.removeEventListener("input", onInput, true);
		document.removeEventListener("keydown", onKeyDown, true);
		document.removeEventListener("mouseup", onMouseUp, true);
		document.removeEventListener("selectionchange", onNativeSelectionChange, true);
	}

	export class CustomSelectionChangeEvent extends CustomEvent<any>
	{
		altKey: boolean;
		isMouse: boolean;
		event: Event;
	}

	function getSelectedRanges()
	{
		const selection = document.getSelection();
		const newRanges = [];

		if (selection !== null) {
			for (let i = 0; i < selection.rangeCount; i++) {
				newRanges.push(selection.getRangeAt(i));
			}
		}

		return newRanges;
	}

	function onInput(ev)
	{
		if (!isInputField(ev.target)) {
			dispatchEventIfSelectionChanged(true, ev, false);
		}
	}

	function onKeyDown(ev)
	{
		const code = ev.keyCode;

		if ((code === 65 && ev[modifierKey] && !ev.shiftKey && !ev.altKey) // Ctrl-A or Cmd-A
			|| (code >= 35 && code <= 40 && ev.shiftKey) // home, end and arrow keys
			|| (ev.ctrlKey && MAC && MAC_MOVE_KEYS.has(code)))
		{
			if (!isInputField(ev.target)) {	// comment to enable selections with keyboard
				setTimeout(() => dispatchEventIfSelectionChanged(true, ev, false), 0);
			}
		}
	}

	function onMouseUp(ev)
	{
		if (ev.button === 0) {
			setTimeout(() => dispatchEventIfSelectionChanged(isInputField(ev.target), ev, true), 0);
		}
	}

	// Chromium also fires the native selectionchange event; pairing it with the polyfill covers
	// edge cases where the selection updates without a matching mouseup path (matches Firefox UX more closely).
	// Debounce so we do not spam while the user is still dragging a selection.
	function onNativeSelectionChange()
	{
		if (nativeSelectionDebounceTimer !== null) {
			clearTimeout(nativeSelectionDebounceTimer);
		}
		nativeSelectionDebounceTimer = setTimeout(() => {
			nativeSelectionDebounceTimer = null;
			const ev = { altKey: false } as KeyboardEvent;
			setTimeout(() => dispatchEventIfSelectionChanged(false, ev, false), 0);
		}, 20);
	}

	function dispatchEventIfSelectionChanged(force, ev, isMouse)
	{
		const newRanges = getSelectedRanges();

		if (force || !areAllRangesEqual(newRanges, ranges)) {
			ranges = newRanges;
			const event = new CustomSelectionChangeEvent("customselectionchange");
			event.altKey = ev.altKey;
			event.isMouse = isMouse;
			event.event = ev;
			setTimeout(() => document.dispatchEvent(event), 0);
		}
	}

	function isInputField(elem)
	{
		return elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
	}

	// compares two lists of ranges to see if the ranges are the exact same
	function areAllRangesEqual(rs1, rs2)
	{
		if (rs1.length !== rs2.length) {
			return false;
		}

		for (let i = 0; i < rs1.length; i++)
		{
			const r1 = rs1[i];
			const r2 = rs2[i];

			const areEqual = r1.startContainer === r2.startContainer
						&& r1.startOffset === r2.startOffset
						&& r1.endContainer === r2.endContainer
						&& r1.endOffset === r2.endOffset;

			if (!areEqual) {
				return false;
			}
		}

		return true;
	}
}