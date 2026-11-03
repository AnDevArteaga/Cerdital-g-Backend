const buffer = require("buffer") as { SlowBuffer?: typeof Buffer; Buffer: typeof Buffer };

if (!buffer.SlowBuffer) {
    buffer.SlowBuffer = buffer.Buffer;
}
