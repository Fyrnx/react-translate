# TODO
- <input type=checkbox checked> make languages in the selection translated to there language or the user main language

<style>
    input {
        outline: none !important;
        accent-color: #7e57c2;
    }

    input[type=checkbox] {
        cursor: pointer;
    }

    li {
        display: flex;
        position: relative;
        &:before { 
            content: '' !important;
            width: 7px !important;
            height: 7px !important;
            background: currentColor !important;
            border-radius: 5px !important;
            left: -10px !important;
            top: 50% !important;
            translate: -50% -55% !important;
            position: absolute !important;
            border: none !important;
        }

        &:has(input:checked):before {color: #7e57c2 !important;}
    }
</style>