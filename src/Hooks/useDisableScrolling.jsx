export default function useDisableScrolling() {
    let disable = (_) => document.body.classList.add("stop-scroll"),
        enable = (_) => document.body.classList.remove("stop-scroll");

    return { enable, disable };
}