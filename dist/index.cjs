'use strict';

var web3_js = require('@solana/web3.js');
var anchor = require('@coral-xyz/anchor');
var BN = require('bn.js');
var spl2 = require('@solana/spl-token');

function _interopDefault(e) {
  return e && e.__esModule ? e : { default: e };
}

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(
          n,
          k,
          d.get
            ? d
            : {
                enumerable: true,
                get: function () {
                  return e[k];
                },
              }
        );
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var BN__default = /*#__PURE__*/ _interopDefault(BN);
var spl2__namespace = /*#__PURE__*/ _interopNamespace(spl2);

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) =>
  typeof require !== 'undefined'
    ? require
    : typeof Proxy !== 'undefined'
      ? new Proxy(x, {
          get: (a, b) => (typeof require !== 'undefined' ? require : a)[b],
        })
      : x)(function (x) {
  if (typeof require !== 'undefined') return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) =>
  function __require2() {
    return (mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports);
  };
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    __defProp(target, 'default', { value: mod, enumerable: true }),
    mod
  )
);

// ../../node_modules/buffer-layout/lib/Layout.js
var require_Layout = __commonJS({
  '../../node_modules/buffer-layout/lib/Layout.js'(exports) {
    var Layout = class {
      constructor(span, property) {
        if (!Number.isInteger(span)) {
          throw new TypeError('span must be an integer');
        }
        this.span = span;
        this.property = property;
      }
      /** Function to create an Object into which decoded properties will
       * be written.
       *
       * Used only for layouts that {@link Layout#decode|decode} to Object
       * instances, which means:
       * * {@link Structure}
       * * {@link Union}
       * * {@link VariantLayout}
       * * {@link BitStructure}
       *
       * If left undefined the JavaScript representation of these layouts
       * will be Object instances.
       *
       * See {@link bindConstructorLayout}.
       */
      makeDestinationObject() {
        return {};
      }
      /**
       * Decode from a Buffer into an JavaScript value.
       *
       * @param {Buffer} b - the buffer from which encoded data is read.
       *
       * @param {Number} [offset] - the offset at which the encoded data
       * starts.  If absent a zero offset is inferred.
       *
       * @returns {(Number|Array|Object)} - the value of the decoded data.
       *
       * @abstract
       */
      decode(b, offset) {
        throw new Error('Layout is abstract');
      }
      /**
       * Encode a JavaScript value into a Buffer.
       *
       * @param {(Number|Array|Object)} src - the value to be encoded into
       * the buffer.  The type accepted depends on the (sub-)type of {@link
       * Layout}.
       *
       * @param {Buffer} b - the buffer into which encoded data will be
       * written.
       *
       * @param {Number} [offset] - the offset at which the encoded data
       * starts.  If absent a zero offset is inferred.
       *
       * @returns {Number} - the number of bytes encoded, including the
       * space skipped for internal padding, but excluding data such as
       * {@link Sequence#count|lengths} when stored {@link
       * ExternalLayout|externally}.  This is the adjustment to `offset`
       * producing the offset where data for the next layout would be
       * written.
       *
       * @abstract
       */
      encode(src, b, offset) {
        throw new Error('Layout is abstract');
      }
      /**
       * Calculate the span of a specific instance of a layout.
       *
       * @param {Buffer} b - the buffer that contains an encoded instance.
       *
       * @param {Number} [offset] - the offset at which the encoded instance
       * starts.  If absent a zero offset is inferred.
       *
       * @return {Number} - the number of bytes covered by the layout
       * instance.  If this method is not overridden in a subclass the
       * definition-time constant {@link Layout#span|span} will be
       * returned.
       *
       * @throws {RangeError} - if the length of the value cannot be
       * determined.
       */
      getSpan(b, offset) {
        if (0 > this.span) {
          throw new RangeError('indeterminate span');
        }
        return this.span;
      }
      /**
       * Replicate the layout using a new property.
       *
       * This function must be used to get a structurally-equivalent layout
       * with a different name since all {@link Layout} instances are
       * immutable.
       *
       * **NOTE** This is a shallow copy.  All fields except {@link
       * Layout#property|property} are strictly equal to the origin layout.
       *
       * @param {String} property - the value for {@link
       * Layout#property|property} in the replica.
       *
       * @returns {Layout} - the copy with {@link Layout#property|property}
       * set to `property`.
       */
      replicate(property) {
        const rv = Object.create(this.constructor.prototype);
        Object.assign(rv, this);
        rv.property = property;
        return rv;
      }
      /**
       * Create an object from layout properties and an array of values.
       *
       * **NOTE** This function returns `undefined` if invoked on a layout
       * that does not return its value as an Object.  Objects are
       * returned for things that are a {@link Structure}, which includes
       * {@link VariantLayout|variant layouts} if they are structures, and
       * excludes {@link Union}s.  If you want this feature for a union
       * you must use {@link Union.getVariant|getVariant} to select the
       * desired layout.
       *
       * @param {Array} values - an array of values that correspond to the
       * default order for properties.  As with {@link Layout#decode|decode}
       * layout elements that have no property name are skipped when
       * iterating over the array values.  Only the top-level properties are
       * assigned; arguments are not assigned to properties of contained
       * layouts.  Any unused values are ignored.
       *
       * @return {(Object|undefined)}
       */
      fromArray(values) {
        return void 0;
      }
    };
    exports.Layout = Layout;
    function nameWithProperty(name, lo) {
      if (lo.property) {
        return name + '[' + lo.property + ']';
      }
      return name;
    }
    exports.nameWithProperty = nameWithProperty;
    function bindConstructorLayout(Class, layout) {
      if ('function' !== typeof Class) {
        throw new TypeError('Class must be constructor');
      }
      if (Class.hasOwnProperty('layout_')) {
        throw new Error('Class is already bound to a layout');
      }
      if (!(layout && layout instanceof Layout)) {
        throw new TypeError('layout must be a Layout');
      }
      if (layout.hasOwnProperty('boundConstructor_')) {
        throw new Error('layout is already bound to a constructor');
      }
      Class.layout_ = layout;
      layout.boundConstructor_ = Class;
      layout.makeDestinationObject = () => new Class();
      Object.defineProperty(Class.prototype, 'encode', {
        value: function (b, offset) {
          return layout.encode(this, b, offset);
        },
        writable: true,
      });
      Object.defineProperty(Class, 'decode', {
        value: function (b, offset) {
          return layout.decode(b, offset);
        },
        writable: true,
      });
    }
    exports.bindConstructorLayout = bindConstructorLayout;
    var ExternalLayout = class extends Layout {
      /**
       * Return `true` iff the external layout decodes to an unsigned
       * integer layout.
       *
       * In that case it can be used as the source of {@link
       * Sequence#count|Sequence counts}, {@link Blob#length|Blob lengths},
       * or as {@link UnionLayoutDiscriminator#layout|external union
       * discriminators}.
       *
       * @abstract
       */
      isCount() {
        throw new Error('ExternalLayout is abstract');
      }
    };
    var GreedyCount = class extends ExternalLayout {
      constructor(elementSpan, property) {
        if (void 0 === elementSpan) {
          elementSpan = 1;
        }
        if (!Number.isInteger(elementSpan) || 0 >= elementSpan) {
          throw new TypeError('elementSpan must be a (positive) integer');
        }
        super(-1, property);
        this.elementSpan = elementSpan;
      }
      /** @override */
      isCount() {
        return true;
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const rem = b.length - offset;
        return Math.floor(rem / this.elementSpan);
      }
      /** @override */
      encode(src, b, offset) {
        return 0;
      }
    };
    var OffsetLayout = class extends ExternalLayout {
      constructor(layout, offset, property) {
        if (!(layout instanceof Layout)) {
          throw new TypeError('layout must be a Layout');
        }
        if (void 0 === offset) {
          offset = 0;
        } else if (!Number.isInteger(offset)) {
          throw new TypeError('offset must be integer or undefined');
        }
        super(layout.span, property || layout.property);
        this.layout = layout;
        this.offset = offset;
      }
      /** @override */
      isCount() {
        return this.layout instanceof UInt || this.layout instanceof UIntBE;
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        return this.layout.decode(b, offset + this.offset);
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        return this.layout.encode(src, b, offset + this.offset);
      }
    };
    var UInt = class extends Layout {
      constructor(span, property) {
        super(span, property);
        if (6 < this.span) {
          throw new RangeError('span must not exceed 6 bytes');
        }
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        return b.readUIntLE(offset, this.span);
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        b.writeUIntLE(src, offset, this.span);
        return this.span;
      }
    };
    var UIntBE = class extends Layout {
      constructor(span, property) {
        super(span, property);
        if (6 < this.span) {
          throw new RangeError('span must not exceed 6 bytes');
        }
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        return b.readUIntBE(offset, this.span);
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        b.writeUIntBE(src, offset, this.span);
        return this.span;
      }
    };
    var Int = class extends Layout {
      constructor(span, property) {
        super(span, property);
        if (6 < this.span) {
          throw new RangeError('span must not exceed 6 bytes');
        }
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        return b.readIntLE(offset, this.span);
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        b.writeIntLE(src, offset, this.span);
        return this.span;
      }
    };
    var IntBE = class extends Layout {
      constructor(span, property) {
        super(span, property);
        if (6 < this.span) {
          throw new RangeError('span must not exceed 6 bytes');
        }
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        return b.readIntBE(offset, this.span);
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        b.writeIntBE(src, offset, this.span);
        return this.span;
      }
    };
    var V2E32 = Math.pow(2, 32);
    function divmodInt64(src) {
      const hi32 = Math.floor(src / V2E32);
      const lo32 = src - hi32 * V2E32;
      return { hi32, lo32 };
    }
    function roundedInt64(hi32, lo32) {
      return hi32 * V2E32 + lo32;
    }
    var NearUInt64 = class extends Layout {
      constructor(property) {
        super(8, property);
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const lo32 = b.readUInt32LE(offset);
        const hi32 = b.readUInt32LE(offset + 4);
        return roundedInt64(hi32, lo32);
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const split = divmodInt64(src);
        b.writeUInt32LE(split.lo32, offset);
        b.writeUInt32LE(split.hi32, offset + 4);
        return 8;
      }
    };
    var NearUInt64BE = class extends Layout {
      constructor(property) {
        super(8, property);
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const hi32 = b.readUInt32BE(offset);
        const lo32 = b.readUInt32BE(offset + 4);
        return roundedInt64(hi32, lo32);
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const split = divmodInt64(src);
        b.writeUInt32BE(split.hi32, offset);
        b.writeUInt32BE(split.lo32, offset + 4);
        return 8;
      }
    };
    var NearInt64 = class extends Layout {
      constructor(property) {
        super(8, property);
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const lo32 = b.readUInt32LE(offset);
        const hi32 = b.readInt32LE(offset + 4);
        return roundedInt64(hi32, lo32);
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const split = divmodInt64(src);
        b.writeUInt32LE(split.lo32, offset);
        b.writeInt32LE(split.hi32, offset + 4);
        return 8;
      }
    };
    var NearInt64BE = class extends Layout {
      constructor(property) {
        super(8, property);
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const hi32 = b.readInt32BE(offset);
        const lo32 = b.readUInt32BE(offset + 4);
        return roundedInt64(hi32, lo32);
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const split = divmodInt64(src);
        b.writeInt32BE(split.hi32, offset);
        b.writeUInt32BE(split.lo32, offset + 4);
        return 8;
      }
    };
    var Float = class extends Layout {
      constructor(property) {
        super(4, property);
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        return b.readFloatLE(offset);
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        b.writeFloatLE(src, offset);
        return 4;
      }
    };
    var FloatBE = class extends Layout {
      constructor(property) {
        super(4, property);
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        return b.readFloatBE(offset);
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        b.writeFloatBE(src, offset);
        return 4;
      }
    };
    var Double = class extends Layout {
      constructor(property) {
        super(8, property);
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        return b.readDoubleLE(offset);
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        b.writeDoubleLE(src, offset);
        return 8;
      }
    };
    var DoubleBE = class extends Layout {
      constructor(property) {
        super(8, property);
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        return b.readDoubleBE(offset);
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        b.writeDoubleBE(src, offset);
        return 8;
      }
    };
    var Sequence = class extends Layout {
      constructor(elementLayout, count, property) {
        if (!(elementLayout instanceof Layout)) {
          throw new TypeError('elementLayout must be a Layout');
        }
        if (!((count instanceof ExternalLayout && count.isCount()) || (Number.isInteger(count) && 0 <= count))) {
          throw new TypeError('count must be non-negative integer or an unsigned integer ExternalLayout');
        }
        let span = -1;
        if (!(count instanceof ExternalLayout) && 0 < elementLayout.span) {
          span = count * elementLayout.span;
        }
        super(span, property);
        this.elementLayout = elementLayout;
        this.count = count;
      }
      /** @override */
      getSpan(b, offset) {
        if (0 <= this.span) {
          return this.span;
        }
        if (void 0 === offset) {
          offset = 0;
        }
        let span = 0;
        let count = this.count;
        if (count instanceof ExternalLayout) {
          count = count.decode(b, offset);
        }
        if (0 < this.elementLayout.span) {
          span = count * this.elementLayout.span;
        } else {
          let idx = 0;
          while (idx < count) {
            span += this.elementLayout.getSpan(b, offset + span);
            ++idx;
          }
        }
        return span;
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const rv = [];
        let i = 0;
        let count = this.count;
        if (count instanceof ExternalLayout) {
          count = count.decode(b, offset);
        }
        while (i < count) {
          rv.push(this.elementLayout.decode(b, offset));
          offset += this.elementLayout.getSpan(b, offset);
          i += 1;
        }
        return rv;
      }
      /** Implement {@link Layout#encode|encode} for {@link Sequence}.
       *
       * **NOTE** If `src` is shorter than {@link Sequence#count|count} then
       * the unused space in the buffer is left unchanged.  If `src` is
       * longer than {@link Sequence#count|count} the unneeded elements are
       * ignored.
       *
       * **NOTE** If {@link Layout#count|count} is an instance of {@link
       * ExternalLayout} then the length of `src` will be encoded as the
       * count after `src` is encoded. */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const elo = this.elementLayout;
        const span = src.reduce((span2, v) => {
          return span2 + elo.encode(v, b, offset + span2);
        }, 0);
        if (this.count instanceof ExternalLayout) {
          this.count.encode(src.length, b, offset);
        }
        return span;
      }
    };
    var Structure = class extends Layout {
      constructor(fields, property, decodePrefixes) {
        if (!(Array.isArray(fields) && fields.reduce((acc, v) => acc && v instanceof Layout, true))) {
          throw new TypeError('fields must be array of Layout instances');
        }
        if ('boolean' === typeof property && void 0 === decodePrefixes) {
          decodePrefixes = property;
          property = void 0;
        }
        for (const fd of fields) {
          if (0 > fd.span && void 0 === fd.property) {
            throw new Error('fields cannot contain unnamed variable-length layout');
          }
        }
        let span = -1;
        try {
          span = fields.reduce((span2, fd) => span2 + fd.getSpan(), 0);
        } catch (e) {}
        super(span, property);
        this.fields = fields;
        this.decodePrefixes = !!decodePrefixes;
      }
      /** @override */
      getSpan(b, offset) {
        if (0 <= this.span) {
          return this.span;
        }
        if (void 0 === offset) {
          offset = 0;
        }
        let span = 0;
        try {
          span = this.fields.reduce((span2, fd) => {
            const fsp = fd.getSpan(b, offset);
            offset += fsp;
            return span2 + fsp;
          }, 0);
        } catch (e) {
          throw new RangeError('indeterminate span');
        }
        return span;
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const dest = this.makeDestinationObject();
        for (const fd of this.fields) {
          if (void 0 !== fd.property) {
            dest[fd.property] = fd.decode(b, offset);
          }
          offset += fd.getSpan(b, offset);
          if (this.decodePrefixes && b.length === offset) {
            break;
          }
        }
        return dest;
      }
      /** Implement {@link Layout#encode|encode} for {@link Structure}.
       *
       * If `src` is missing a property for a member with a defined {@link
       * Layout#property|property} the corresponding region of the buffer is
       * left unmodified. */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const firstOffset = offset;
        let lastOffset = 0;
        let lastWrote = 0;
        for (const fd of this.fields) {
          let span = fd.span;
          lastWrote = 0 < span ? span : 0;
          if (void 0 !== fd.property) {
            const fv = src[fd.property];
            if (void 0 !== fv) {
              lastWrote = fd.encode(fv, b, offset);
              if (0 > span) {
                span = fd.getSpan(b, offset);
              }
            }
          }
          lastOffset = offset;
          offset += span;
        }
        return lastOffset + lastWrote - firstOffset;
      }
      /** @override */
      fromArray(values) {
        const dest = this.makeDestinationObject();
        for (const fd of this.fields) {
          if (void 0 !== fd.property && 0 < values.length) {
            dest[fd.property] = values.shift();
          }
        }
        return dest;
      }
      /**
       * Get access to the layout of a given property.
       *
       * @param {String} property - the structure member of interest.
       *
       * @return {Layout} - the layout associated with `property`, or
       * undefined if there is no such property.
       */
      layoutFor(property) {
        if ('string' !== typeof property) {
          throw new TypeError('property must be string');
        }
        for (const fd of this.fields) {
          if (fd.property === property) {
            return fd;
          }
        }
      }
      /**
       * Get the offset of a structure member.
       *
       * @param {String} property - the structure member of interest.
       *
       * @return {Number} - the offset in bytes to the start of `property`
       * within the structure, or undefined if `property` is not a field
       * within the structure.  If the property is a member but follows a
       * variable-length structure member a negative number will be
       * returned.
       */
      offsetOf(property) {
        if ('string' !== typeof property) {
          throw new TypeError('property must be string');
        }
        let offset = 0;
        for (const fd of this.fields) {
          if (fd.property === property) {
            return offset;
          }
          if (0 > fd.span) {
            offset = -1;
          } else if (0 <= offset) {
            offset += fd.span;
          }
        }
      }
    };
    var UnionDiscriminator = class {
      constructor(property) {
        this.property = property;
      }
      /** Analog to {@link Layout#decode|Layout decode} for union discriminators.
       *
       * The implementation of this method need not reference the buffer if
       * variant information is available through other means. */
      decode() {
        throw new Error('UnionDiscriminator is abstract');
      }
      /** Analog to {@link Layout#decode|Layout encode} for union discriminators.
       *
       * The implementation of this method need not store the value if
       * variant information is maintained through other means. */
      encode() {
        throw new Error('UnionDiscriminator is abstract');
      }
    };
    var UnionLayoutDiscriminator = class extends UnionDiscriminator {
      constructor(layout, property) {
        if (!(layout instanceof ExternalLayout && layout.isCount())) {
          throw new TypeError('layout must be an unsigned integer ExternalLayout');
        }
        super(property || layout.property || 'variant');
        this.layout = layout;
      }
      /** Delegate decoding to {@link UnionLayoutDiscriminator#layout|layout}. */
      decode(b, offset) {
        return this.layout.decode(b, offset);
      }
      /** Delegate encoding to {@link UnionLayoutDiscriminator#layout|layout}. */
      encode(src, b, offset) {
        return this.layout.encode(src, b, offset);
      }
    };
    var Union = class extends Layout {
      constructor(discr, defaultLayout, property) {
        const upv = discr instanceof UInt || discr instanceof UIntBE;
        if (upv) {
          discr = new UnionLayoutDiscriminator(new OffsetLayout(discr));
        } else if (discr instanceof ExternalLayout && discr.isCount()) {
          discr = new UnionLayoutDiscriminator(discr);
        } else if (!(discr instanceof UnionDiscriminator)) {
          throw new TypeError('discr must be a UnionDiscriminator or an unsigned integer layout');
        }
        if (void 0 === defaultLayout) {
          defaultLayout = null;
        }
        if (!(null === defaultLayout || defaultLayout instanceof Layout)) {
          throw new TypeError('defaultLayout must be null or a Layout');
        }
        if (null !== defaultLayout) {
          if (0 > defaultLayout.span) {
            throw new Error('defaultLayout must have constant span');
          }
          if (void 0 === defaultLayout.property) {
            defaultLayout = defaultLayout.replicate('content');
          }
        }
        let span = -1;
        if (defaultLayout) {
          span = defaultLayout.span;
          if (0 <= span && upv) {
            span += discr.layout.span;
          }
        }
        super(span, property);
        this.discriminator = discr;
        this.usesPrefixDiscriminator = upv;
        this.defaultLayout = defaultLayout;
        this.registry = {};
        let boundGetSourceVariant = this.defaultGetSourceVariant.bind(this);
        this.getSourceVariant = function (src) {
          return boundGetSourceVariant(src);
        };
        this.configGetSourceVariant = function (gsv) {
          boundGetSourceVariant = gsv.bind(this);
        };
      }
      /** @override */
      getSpan(b, offset) {
        if (0 <= this.span) {
          return this.span;
        }
        if (void 0 === offset) {
          offset = 0;
        }
        const vlo = this.getVariant(b, offset);
        if (!vlo) {
          throw new Error('unable to determine span for unrecognized variant');
        }
        return vlo.getSpan(b, offset);
      }
      /**
       * Method to infer a registered Union variant compatible with `src`.
       *
       * The first satisified rule in the following sequence defines the
       * return value:
       * * If `src` has properties matching the Union discriminator and
       *   the default layout, `undefined` is returned regardless of the
       *   value of the discriminator property (this ensures the default
       *   layout will be used);
       * * If `src` has a property matching the Union discriminator, the
       *   value of the discriminator identifies a registered variant, and
       *   either (a) the variant has no layout, or (b) `src` has the
       *   variant's property, then the variant is returned (because the
       *   source satisfies the constraints of the variant it identifies);
       * * If `src` does not have a property matching the Union
       *   discriminator, but does have a property matching a registered
       *   variant, then the variant is returned (because the source
       *   matches a variant without an explicit conflict);
       * * An error is thrown (because we either can't identify a variant,
       *   or we were explicitly told the variant but can't satisfy it).
       *
       * @param {Object} src - an object presumed to be compatible with
       * the content of the Union.
       *
       * @return {(undefined|VariantLayout)} - as described above.
       *
       * @throws {Error} - if `src` cannot be associated with a default or
       * registered variant.
       */
      defaultGetSourceVariant(src) {
        if (src.hasOwnProperty(this.discriminator.property)) {
          if (this.defaultLayout && src.hasOwnProperty(this.defaultLayout.property)) {
            return void 0;
          }
          const vlo = this.registry[src[this.discriminator.property]];
          if (vlo && (!vlo.layout || src.hasOwnProperty(vlo.property))) {
            return vlo;
          }
        } else {
          for (const tag in this.registry) {
            const vlo = this.registry[tag];
            if (src.hasOwnProperty(vlo.property)) {
              return vlo;
            }
          }
        }
        throw new Error('unable to infer src variant');
      }
      /** Implement {@link Layout#decode|decode} for {@link Union}.
       *
       * If the variant is {@link Union#addVariant|registered} the return
       * value is an instance of that variant, with no explicit
       * discriminator.  Otherwise the {@link Union#defaultLayout|default
       * layout} is used to decode the content. */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        let dest;
        const dlo = this.discriminator;
        const discr = dlo.decode(b, offset);
        let clo = this.registry[discr];
        if (void 0 === clo) {
          let contentOffset = 0;
          clo = this.defaultLayout;
          if (this.usesPrefixDiscriminator) {
            contentOffset = dlo.layout.span;
          }
          dest = this.makeDestinationObject();
          dest[dlo.property] = discr;
          dest[clo.property] = this.defaultLayout.decode(b, offset + contentOffset);
        } else {
          dest = clo.decode(b, offset);
        }
        return dest;
      }
      /** Implement {@link Layout#encode|encode} for {@link Union}.
       *
       * This API assumes the `src` object is consistent with the union's
       * {@link Union#defaultLayout|default layout}.  To encode variants
       * use the appropriate variant-specific {@link VariantLayout#encode}
       * method. */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const vlo = this.getSourceVariant(src);
        if (void 0 === vlo) {
          const dlo = this.discriminator;
          const clo = this.defaultLayout;
          let contentOffset = 0;
          if (this.usesPrefixDiscriminator) {
            contentOffset = dlo.layout.span;
          }
          dlo.encode(src[dlo.property], b, offset);
          return contentOffset + clo.encode(src[clo.property], b, offset + contentOffset);
        }
        return vlo.encode(src, b, offset);
      }
      /** Register a new variant structure within a union.  The newly
       * created variant is returned.
       *
       * @param {Number} variant - initializer for {@link
       * VariantLayout#variant|variant}.
       *
       * @param {Layout} layout - initializer for {@link
       * VariantLayout#layout|layout}.
       *
       * @param {String} property - initializer for {@link
       * Layout#property|property}.
       *
       * @return {VariantLayout} */
      addVariant(variant, layout, property) {
        const rv = new VariantLayout(this, variant, layout, property);
        this.registry[variant] = rv;
        return rv;
      }
      /**
       * Get the layout associated with a registered variant.
       *
       * If `vb` does not produce a registered variant the function returns
       * `undefined`.
       *
       * @param {(Number|Buffer)} vb - either the variant number, or a
       * buffer from which the discriminator is to be read.
       *
       * @param {Number} offset - offset into `vb` for the start of the
       * union.  Used only when `vb` is an instance of {Buffer}.
       *
       * @return {({VariantLayout}|undefined)}
       */
      getVariant(vb, offset) {
        let variant = vb;
        if (Buffer.isBuffer(vb)) {
          if (void 0 === offset) {
            offset = 0;
          }
          variant = this.discriminator.decode(vb, offset);
        }
        return this.registry[variant];
      }
    };
    var VariantLayout = class extends Layout {
      constructor(union, variant, layout, property) {
        if (!(union instanceof Union)) {
          throw new TypeError('union must be a Union');
        }
        if (!Number.isInteger(variant) || 0 > variant) {
          throw new TypeError('variant must be a (non-negative) integer');
        }
        if ('string' === typeof layout && void 0 === property) {
          property = layout;
          layout = null;
        }
        if (layout) {
          if (!(layout instanceof Layout)) {
            throw new TypeError('layout must be a Layout');
          }
          if (null !== union.defaultLayout && 0 <= layout.span && layout.span > union.defaultLayout.span) {
            throw new Error('variant span exceeds span of containing union');
          }
          if ('string' !== typeof property) {
            throw new TypeError('variant must have a String property');
          }
        }
        let span = union.span;
        if (0 > union.span) {
          span = layout ? layout.span : 0;
          if (0 <= span && union.usesPrefixDiscriminator) {
            span += union.discriminator.layout.span;
          }
        }
        super(span, property);
        this.union = union;
        this.variant = variant;
        this.layout = layout || null;
      }
      /** @override */
      getSpan(b, offset) {
        if (0 <= this.span) {
          return this.span;
        }
        if (void 0 === offset) {
          offset = 0;
        }
        let contentOffset = 0;
        if (this.union.usesPrefixDiscriminator) {
          contentOffset = this.union.discriminator.layout.span;
        }
        return contentOffset + this.layout.getSpan(b, offset + contentOffset);
      }
      /** @override */
      decode(b, offset) {
        const dest = this.makeDestinationObject();
        if (void 0 === offset) {
          offset = 0;
        }
        if (this !== this.union.getVariant(b, offset)) {
          throw new Error('variant mismatch');
        }
        let contentOffset = 0;
        if (this.union.usesPrefixDiscriminator) {
          contentOffset = this.union.discriminator.layout.span;
        }
        if (this.layout) {
          dest[this.property] = this.layout.decode(b, offset + contentOffset);
        } else if (this.property) {
          dest[this.property] = true;
        } else if (this.union.usesPrefixDiscriminator) {
          dest[this.union.discriminator.property] = this.variant;
        }
        return dest;
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        let contentOffset = 0;
        if (this.union.usesPrefixDiscriminator) {
          contentOffset = this.union.discriminator.layout.span;
        }
        if (this.layout && !src.hasOwnProperty(this.property)) {
          throw new TypeError('variant lacks property ' + this.property);
        }
        this.union.discriminator.encode(this.variant, b, offset);
        let span = contentOffset;
        if (this.layout) {
          this.layout.encode(src[this.property], b, offset + contentOffset);
          span += this.layout.getSpan(b, offset + contentOffset);
          if (0 <= this.union.span && span > this.union.span) {
            throw new Error('encoded variant overruns containing union');
          }
        }
        return span;
      }
      /** Delegate {@link Layout#fromArray|fromArray} to {@link
       * VariantLayout#layout|layout}. */
      fromArray(values) {
        if (this.layout) {
          return this.layout.fromArray(values);
        }
      }
    };
    function fixBitwiseResult(v) {
      if (0 > v) {
        v += 4294967296;
      }
      return v;
    }
    var BitStructure = class extends Layout {
      constructor(word, msb, property) {
        if (!(word instanceof UInt || word instanceof UIntBE)) {
          throw new TypeError('word must be a UInt or UIntBE layout');
        }
        if ('string' === typeof msb && void 0 === property) {
          property = msb;
          msb = void 0;
        }
        if (4 < word.span) {
          throw new RangeError('word cannot exceed 32 bits');
        }
        super(word.span, property);
        this.word = word;
        this.msb = !!msb;
        this.fields = [];
        let value = 0;
        this._packedSetValue = function (v) {
          value = fixBitwiseResult(v);
          return this;
        };
        this._packedGetValue = function () {
          return value;
        };
      }
      /** @override */
      decode(b, offset) {
        const dest = this.makeDestinationObject();
        if (void 0 === offset) {
          offset = 0;
        }
        const value = this.word.decode(b, offset);
        this._packedSetValue(value);
        for (const fd of this.fields) {
          if (void 0 !== fd.property) {
            dest[fd.property] = fd.decode(value);
          }
        }
        return dest;
      }
      /** Implement {@link Layout#encode|encode} for {@link BitStructure}.
       *
       * If `src` is missing a property for a member with a defined {@link
       * Layout#property|property} the corresponding region of the packed
       * value is left unmodified.  Unused bits are also left unmodified. */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        const value = this.word.decode(b, offset);
        this._packedSetValue(value);
        for (const fd of this.fields) {
          if (void 0 !== fd.property) {
            const fv = src[fd.property];
            if (void 0 !== fv) {
              fd.encode(fv);
            }
          }
        }
        return this.word.encode(this._packedGetValue(), b, offset);
      }
      /** Register a new bitfield with a containing bit structure.  The
       * resulting bitfield is returned.
       *
       * @param {Number} bits - initializer for {@link BitField#bits|bits}.
       *
       * @param {string} property - initializer for {@link
       * Layout#property|property}.
       *
       * @return {BitField} */
      addField(bits, property) {
        const bf = new BitField(this, bits, property);
        this.fields.push(bf);
        return bf;
      }
      /** As with {@link BitStructure#addField|addField} for single-bit
       * fields with `boolean` value representation.
       *
       * @param {string} property - initializer for {@link
       * Layout#property|property}.
       *
       * @return {Boolean} */
      addBoolean(property) {
        const bf = new Boolean(this, property);
        this.fields.push(bf);
        return bf;
      }
      /**
       * Get access to the bit field for a given property.
       *
       * @param {String} property - the bit field of interest.
       *
       * @return {BitField} - the field associated with `property`, or
       * undefined if there is no such property.
       */
      fieldFor(property) {
        if ('string' !== typeof property) {
          throw new TypeError('property must be string');
        }
        for (const fd of this.fields) {
          if (fd.property === property) {
            return fd;
          }
        }
      }
    };
    var BitField = class {
      constructor(container, bits, property) {
        if (!(container instanceof BitStructure)) {
          throw new TypeError('container must be a BitStructure');
        }
        if (!Number.isInteger(bits) || 0 >= bits) {
          throw new TypeError('bits must be positive integer');
        }
        const totalBits = 8 * container.span;
        const usedBits = container.fields.reduce((sum, fd) => sum + fd.bits, 0);
        if (bits + usedBits > totalBits) {
          throw new Error(
            'bits too long for span remainder (' + (totalBits - usedBits) + ' of ' + totalBits + ' remain)'
          );
        }
        this.container = container;
        this.bits = bits;
        this.valueMask = (1 << bits) - 1;
        if (32 === bits) {
          this.valueMask = 4294967295;
        }
        this.start = usedBits;
        if (this.container.msb) {
          this.start = totalBits - usedBits - bits;
        }
        this.wordMask = fixBitwiseResult(this.valueMask << this.start);
        this.property = property;
      }
      /** Store a value into the corresponding subsequence of the containing
       * bit field. */
      decode() {
        const word = this.container._packedGetValue();
        const wordValue = fixBitwiseResult(word & this.wordMask);
        const value = wordValue >>> this.start;
        return value;
      }
      /** Store a value into the corresponding subsequence of the containing
       * bit field.
       *
       * **NOTE** This is not a specialization of {@link
       * Layout#encode|Layout.encode} and there is no return value. */
      encode(value) {
        if (!Number.isInteger(value) || value !== fixBitwiseResult(value & this.valueMask)) {
          throw new TypeError(
            nameWithProperty('BitField.encode', this) + ' value must be integer not exceeding ' + this.valueMask
          );
        }
        const word = this.container._packedGetValue();
        const wordValue = fixBitwiseResult(value << this.start);
        this.container._packedSetValue(fixBitwiseResult(word & ~this.wordMask) | wordValue);
      }
    };
    var Boolean = class extends BitField {
      constructor(container, property) {
        super(container, 1, property);
      }
      /** Override {@link BitField#decode|decode} for {@link Boolean|Boolean}.
       *
       * @returns {boolean} */
      decode(b, offset) {
        return !!BitField.prototype.decode.call(this, b, offset);
      }
      /** @override */
      encode(value) {
        if ('boolean' === typeof value) {
          value = +value;
        }
        return BitField.prototype.encode.call(this, value);
      }
    };
    var Blob = class extends Layout {
      constructor(length, property) {
        if (!((length instanceof ExternalLayout && length.isCount()) || (Number.isInteger(length) && 0 <= length))) {
          throw new TypeError('length must be positive integer or an unsigned integer ExternalLayout');
        }
        let span = -1;
        if (!(length instanceof ExternalLayout)) {
          span = length;
        }
        super(span, property);
        this.length = length;
      }
      /** @override */
      getSpan(b, offset) {
        let span = this.span;
        if (0 > span) {
          span = this.length.decode(b, offset);
        }
        return span;
      }
      /** @override */
      decode(b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        let span = this.span;
        if (0 > span) {
          span = this.length.decode(b, offset);
        }
        return b.slice(offset, offset + span);
      }
      /** Implement {@link Layout#encode|encode} for {@link Blob}.
       *
       * **NOTE** If {@link Layout#count|count} is an instance of {@link
       * ExternalLayout} then the length of `src` will be encoded as the
       * count after `src` is encoded. */
      encode(src, b, offset) {
        let span = this.length;
        if (this.length instanceof ExternalLayout) {
          span = src.length;
        }
        if (!(Buffer.isBuffer(src) && span === src.length)) {
          throw new TypeError(nameWithProperty('Blob.encode', this) + ' requires (length ' + span + ') Buffer as src');
        }
        if (offset + span > b.length) {
          throw new RangeError('encoding overruns Buffer');
        }
        b.write(src.toString('hex'), offset, span, 'hex');
        if (this.length instanceof ExternalLayout) {
          this.length.encode(span, b, offset);
        }
        return span;
      }
    };
    var CString = class extends Layout {
      constructor(property) {
        super(-1, property);
      }
      /** @override */
      getSpan(b, offset) {
        if (!Buffer.isBuffer(b)) {
          throw new TypeError('b must be a Buffer');
        }
        if (void 0 === offset) {
          offset = 0;
        }
        let idx = offset;
        while (idx < b.length && 0 !== b[idx]) {
          idx += 1;
        }
        return 1 + idx - offset;
      }
      /** @override */
      decode(b, offset, dest) {
        if (void 0 === offset) {
          offset = 0;
        }
        let span = this.getSpan(b, offset);
        return b.slice(offset, offset + span - 1).toString('utf-8');
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        if ('string' !== typeof src) {
          src = src.toString();
        }
        const srcb = new Buffer(src, 'utf8');
        const span = srcb.length;
        if (offset + span > b.length) {
          throw new RangeError('encoding overruns Buffer');
        }
        srcb.copy(b, offset);
        b[offset + span] = 0;
        return span + 1;
      }
    };
    var UTF8 = class extends Layout {
      constructor(maxSpan, property) {
        if ('string' === typeof maxSpan && void 0 === property) {
          property = maxSpan;
          maxSpan = void 0;
        }
        if (void 0 === maxSpan) {
          maxSpan = -1;
        } else if (!Number.isInteger(maxSpan)) {
          throw new TypeError('maxSpan must be an integer');
        }
        super(-1, property);
        this.maxSpan = maxSpan;
      }
      /** @override */
      getSpan(b, offset) {
        if (!Buffer.isBuffer(b)) {
          throw new TypeError('b must be a Buffer');
        }
        if (void 0 === offset) {
          offset = 0;
        }
        return b.length - offset;
      }
      /** @override */
      decode(b, offset, dest) {
        if (void 0 === offset) {
          offset = 0;
        }
        let span = this.getSpan(b, offset);
        if (0 <= this.maxSpan && this.maxSpan < span) {
          throw new RangeError('text length exceeds maxSpan');
        }
        return b.slice(offset, offset + span).toString('utf-8');
      }
      /** @override */
      encode(src, b, offset) {
        if (void 0 === offset) {
          offset = 0;
        }
        if ('string' !== typeof src) {
          src = src.toString();
        }
        const srcb = new Buffer(src, 'utf8');
        const span = srcb.length;
        if (0 <= this.maxSpan && this.maxSpan < span) {
          throw new RangeError('text length exceeds maxSpan');
        }
        if (offset + span > b.length) {
          throw new RangeError('encoding overruns Buffer');
        }
        srcb.copy(b, offset);
        return span;
      }
    };
    var Constant = class extends Layout {
      constructor(value, property) {
        super(0, property);
        this.value = value;
      }
      /** @override */
      decode(b, offset, dest) {
        return this.value;
      }
      /** @override */
      encode(src, b, offset) {
        return 0;
      }
    };
    exports.ExternalLayout = ExternalLayout;
    exports.GreedyCount = GreedyCount;
    exports.OffsetLayout = OffsetLayout;
    exports.UInt = UInt;
    exports.UIntBE = UIntBE;
    exports.Int = Int;
    exports.IntBE = IntBE;
    exports.Float = Float;
    exports.FloatBE = FloatBE;
    exports.Double = Double;
    exports.DoubleBE = DoubleBE;
    exports.Sequence = Sequence;
    exports.Structure = Structure;
    exports.UnionDiscriminator = UnionDiscriminator;
    exports.UnionLayoutDiscriminator = UnionLayoutDiscriminator;
    exports.Union = Union;
    exports.VariantLayout = VariantLayout;
    exports.BitStructure = BitStructure;
    exports.BitField = BitField;
    exports.Boolean = Boolean;
    exports.Blob = Blob;
    exports.CString = CString;
    exports.UTF8 = UTF8;
    exports.Constant = Constant;
    exports.greedy = (elementSpan, property) => new GreedyCount(elementSpan, property);
    exports.offset = (layout, offset, property) => new OffsetLayout(layout, offset, property);
    exports.u8 = (property) => new UInt(1, property);
    exports.u16 = (property) => new UInt(2, property);
    exports.u24 = (property) => new UInt(3, property);
    exports.u32 = (property) => new UInt(4, property);
    exports.u40 = (property) => new UInt(5, property);
    exports.u48 = (property) => new UInt(6, property);
    exports.nu64 = (property) => new NearUInt64(property);
    exports.u16be = (property) => new UIntBE(2, property);
    exports.u24be = (property) => new UIntBE(3, property);
    exports.u32be = (property) => new UIntBE(4, property);
    exports.u40be = (property) => new UIntBE(5, property);
    exports.u48be = (property) => new UIntBE(6, property);
    exports.nu64be = (property) => new NearUInt64BE(property);
    exports.s8 = (property) => new Int(1, property);
    exports.s16 = (property) => new Int(2, property);
    exports.s24 = (property) => new Int(3, property);
    exports.s32 = (property) => new Int(4, property);
    exports.s40 = (property) => new Int(5, property);
    exports.s48 = (property) => new Int(6, property);
    exports.ns64 = (property) => new NearInt64(property);
    exports.s16be = (property) => new IntBE(2, property);
    exports.s24be = (property) => new IntBE(3, property);
    exports.s32be = (property) => new IntBE(4, property);
    exports.s40be = (property) => new IntBE(5, property);
    exports.s48be = (property) => new IntBE(6, property);
    exports.ns64be = (property) => new NearInt64BE(property);
    exports.f32 = (property) => new Float(property);
    exports.f32be = (property) => new FloatBE(property);
    exports.f64 = (property) => new Double(property);
    exports.f64be = (property) => new DoubleBE(property);
    exports.struct = (fields, property, decodePrefixes) => new Structure(fields, property, decodePrefixes);
    exports.bits = (word, msb, property) => new BitStructure(word, msb, property);
    exports.seq = (elementLayout, count, property) => new Sequence(elementLayout, count, property);
    exports.union = (discr, defaultLayout, property) => new Union(discr, defaultLayout, property);
    exports.unionLayoutDiscriminator = (layout, property) => new UnionLayoutDiscriminator(layout, property);
    exports.blob = (length, property) => new Blob(length, property);
    exports.cstr = (property) => new CString(property);
    exports.utf8 = (maxSpan, property) => new UTF8(maxSpan, property);
    exports.const = (value, property) => new Constant(value, property);
  },
});

// ../../node_modules/@coral-xyz/borsh/dist/index.js
var require_dist = __commonJS({
  '../../node_modules/@coral-xyz/borsh/dist/index.js'(exports) {
    var __importDefault =
      (exports && exports.__importDefault) ||
      function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
      };
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.map =
      exports.array =
      exports.rustEnum =
      exports.str =
      exports.vecU8 =
      exports.tagged =
      exports.vec =
      exports.bool =
      exports.option =
      exports.publicKey =
      exports.i256 =
      exports.u256 =
      exports.i128 =
      exports.u128 =
      exports.i64 =
      exports.u64 =
      exports.struct =
      exports.f64 =
      exports.f32 =
      exports.i32 =
      exports.u32 =
      exports.i16 =
      exports.u16 =
      exports.i8 =
      exports.u8 =
        void 0;
    var buffer_layout_1 = require_Layout();
    var web3_js_1 = __require('@solana/web3.js');
    var bn_js_1 = __importDefault(__require('bn.js'));
    var buffer_layout_2 = require_Layout();
    Object.defineProperty(exports, 'u8', {
      enumerable: true,
      get: function () {
        return buffer_layout_2.u8;
      },
    });
    Object.defineProperty(exports, 'i8', {
      enumerable: true,
      get: function () {
        return buffer_layout_2.s8;
      },
    });
    Object.defineProperty(exports, 'u16', {
      enumerable: true,
      get: function () {
        return buffer_layout_2.u16;
      },
    });
    Object.defineProperty(exports, 'i16', {
      enumerable: true,
      get: function () {
        return buffer_layout_2.s16;
      },
    });
    Object.defineProperty(exports, 'u32', {
      enumerable: true,
      get: function () {
        return buffer_layout_2.u32;
      },
    });
    Object.defineProperty(exports, 'i32', {
      enumerable: true,
      get: function () {
        return buffer_layout_2.s32;
      },
    });
    Object.defineProperty(exports, 'f32', {
      enumerable: true,
      get: function () {
        return buffer_layout_2.f32;
      },
    });
    Object.defineProperty(exports, 'f64', {
      enumerable: true,
      get: function () {
        return buffer_layout_2.f64;
      },
    });
    Object.defineProperty(exports, 'struct', {
      enumerable: true,
      get: function () {
        return buffer_layout_2.struct;
      },
    });
    var BNLayout = class extends buffer_layout_1.Layout {
      constructor(span, signed, property) {
        super(span, property);
        this.blob = (0, buffer_layout_1.blob)(span);
        this.signed = signed;
      }
      decode(b, offset = 0) {
        const num = new bn_js_1.default(this.blob.decode(b, offset), 10, 'le');
        if (this.signed) {
          return num.fromTwos(this.span * 8).clone();
        }
        return num;
      }
      encode(src, b, offset = 0) {
        if (this.signed) {
          src = src.toTwos(this.span * 8);
        }
        return this.blob.encode(src.toArrayLike(Buffer, 'le', this.span), b, offset);
      }
    };
    function u642(property) {
      return new BNLayout(8, false, property);
    }
    exports.u64 = u642;
    function i64(property) {
      return new BNLayout(8, true, property);
    }
    exports.i64 = i64;
    function u128(property) {
      return new BNLayout(16, false, property);
    }
    exports.u128 = u128;
    function i128(property) {
      return new BNLayout(16, true, property);
    }
    exports.i128 = i128;
    function u256(property) {
      return new BNLayout(32, false, property);
    }
    exports.u256 = u256;
    function i256(property) {
      return new BNLayout(32, true, property);
    }
    exports.i256 = i256;
    var WrappedLayout = class extends buffer_layout_1.Layout {
      constructor(layout, decoder, encoder, property) {
        super(layout.span, property);
        this.layout = layout;
        this.decoder = decoder;
        this.encoder = encoder;
      }
      decode(b, offset) {
        return this.decoder(this.layout.decode(b, offset));
      }
      encode(src, b, offset) {
        return this.layout.encode(this.encoder(src), b, offset);
      }
      getSpan(b, offset) {
        return this.layout.getSpan(b, offset);
      }
    };
    function publicKey2(property) {
      return new WrappedLayout(
        (0, buffer_layout_1.blob)(32),
        (b) => new web3_js_1.PublicKey(b),
        (key) => key.toBuffer(),
        property
      );
    }
    exports.publicKey = publicKey2;
    var OptionLayout = class extends buffer_layout_1.Layout {
      constructor(layout, property) {
        super(-1, property);
        this.layout = layout;
        this.discriminator = (0, buffer_layout_1.u8)();
      }
      encode(src, b, offset = 0) {
        if (src === null || src === void 0) {
          return this.discriminator.encode(0, b, offset);
        }
        this.discriminator.encode(1, b, offset);
        return this.layout.encode(src, b, offset + 1) + 1;
      }
      decode(b, offset = 0) {
        const discriminator = this.discriminator.decode(b, offset);
        if (discriminator === 0) {
          return null;
        } else if (discriminator === 1) {
          return this.layout.decode(b, offset + 1);
        }
        throw new Error('Invalid option ' + this.property);
      }
      getSpan(b, offset = 0) {
        const discriminator = this.discriminator.decode(b, offset);
        if (discriminator === 0) {
          return 1;
        } else if (discriminator === 1) {
          return this.layout.getSpan(b, offset + 1) + 1;
        }
        throw new Error('Invalid option ' + this.property);
      }
    };
    function option(layout, property) {
      return new OptionLayout(layout, property);
    }
    exports.option = option;
    function bool(property) {
      return new WrappedLayout((0, buffer_layout_1.u8)(), decodeBool, encodeBool, property);
    }
    exports.bool = bool;
    function decodeBool(value) {
      if (value === 0) {
        return false;
      } else if (value === 1) {
        return true;
      }
      throw new Error('Invalid bool: ' + value);
    }
    function encodeBool(value) {
      return value ? 1 : 0;
    }
    function vec(elementLayout, property) {
      const length = (0, buffer_layout_1.u32)('length');
      const layout = (0, buffer_layout_1.struct)([
        length,
        (0, buffer_layout_1.seq)(elementLayout, (0, buffer_layout_1.offset)(length, -length.span), 'values'),
      ]);
      return new WrappedLayout(
        layout,
        ({ values }) => values,
        (values) => ({ values }),
        property
      );
    }
    exports.vec = vec;
    function tagged(tag, layout, property) {
      const wrappedLayout = (0, buffer_layout_1.struct)([u642('tag'), layout.replicate('data')]);
      function decodeTag({ tag: receivedTag, data }) {
        if (!receivedTag.eq(tag)) {
          throw new Error('Invalid tag, expected: ' + tag.toString('hex') + ', got: ' + receivedTag.toString('hex'));
        }
        return data;
      }
      return new WrappedLayout(wrappedLayout, decodeTag, (data) => ({ tag, data }), property);
    }
    exports.tagged = tagged;
    function vecU82(property) {
      const length = (0, buffer_layout_1.u32)('length');
      const layout = (0, buffer_layout_1.struct)([
        length,
        (0, buffer_layout_1.blob)((0, buffer_layout_1.offset)(length, -length.span), 'data'),
      ]);
      return new WrappedLayout(
        layout,
        ({ data }) => data,
        (data) => ({ data }),
        property
      );
    }
    exports.vecU8 = vecU82;
    function str(property) {
      return new WrappedLayout(
        vecU82(),
        (data) => data.toString('utf-8'),
        (s) => Buffer.from(s, 'utf-8'),
        property
      );
    }
    exports.str = str;
    function rustEnum(variants, property, discriminant) {
      const unionLayout = (0, buffer_layout_1.union)(
        discriminant !== null && discriminant !== void 0 ? discriminant : (0, buffer_layout_1.u8)(),
        property
      );
      variants.forEach((variant, index) => unionLayout.addVariant(index, variant, variant.property));
      return unionLayout;
    }
    exports.rustEnum = rustEnum;
    function array(elementLayout, length, property) {
      const layout = (0, buffer_layout_1.struct)([(0, buffer_layout_1.seq)(elementLayout, length, 'values')]);
      return new WrappedLayout(
        layout,
        ({ values }) => values,
        (values) => ({ values }),
        property
      );
    }
    exports.array = array;
    var MapEntryLayout = class extends buffer_layout_1.Layout {
      constructor(keyLayout, valueLayout, property) {
        super(keyLayout.span + valueLayout.span, property);
        this.keyLayout = keyLayout;
        this.valueLayout = valueLayout;
      }
      decode(b, offset) {
        offset = offset || 0;
        const key = this.keyLayout.decode(b, offset);
        const value = this.valueLayout.decode(b, offset + this.keyLayout.getSpan(b, offset));
        return [key, value];
      }
      encode(src, b, offset) {
        offset = offset || 0;
        const keyBytes = this.keyLayout.encode(src[0], b, offset);
        const valueBytes = this.valueLayout.encode(src[1], b, offset + keyBytes);
        return keyBytes + valueBytes;
      }
      getSpan(b, offset) {
        return this.keyLayout.getSpan(b, offset) + this.valueLayout.getSpan(b, offset);
      }
    };
    function map(keyLayout, valueLayout, property) {
      const length = (0, buffer_layout_1.u32)('length');
      const layout = (0, buffer_layout_1.struct)([
        length,
        (0, buffer_layout_1.seq)(
          new MapEntryLayout(keyLayout, valueLayout),
          (0, buffer_layout_1.offset)(length, -length.span),
          'values'
        ),
      ]);
      return new WrappedLayout(
        layout,
        ({ values }) => new Map(values),
        (values) => ({ values: Array.from(values.entries()) }),
        property
      );
    }
    exports.map = map;
  },
});

// src/types/pair.ts
var SwapCurveType = /* @__PURE__ */ ((SwapCurveType2) => {
  SwapCurveType2['ConstantProduct'] = 'ConstantProduct';
  SwapCurveType2['ConstantPrice'] = 'ConstantPrice';
  SwapCurveType2['Stable'] = 'Stable';
  SwapCurveType2['Offset'] = 'Offset';
  return SwapCurveType2;
})(SwapCurveType || {});

// src/constants/config.ts
var MODE = /* @__PURE__ */ ((MODE3) => {
  MODE3['DEVNET'] = 'devnet';
  MODE3['MAINNET'] = 'mainnet';
  return MODE3;
})(MODE || {});
var SAROS_FEE_OWNER = new web3_js.PublicKey('FDbLZ5DRo61queVRH9LL1mQnsiAoubQEnoCRuPEmH9M8');
var AMM_PROGRAM_IDS = {
  ['mainnet' /* MAINNET */]: new web3_js.PublicKey('SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr'),
  ['devnet' /* DEVNET */]: new web3_js.PublicKey('SSStkgZHW17LRbGUFSDQqzZ4jMXpfmVxHDbWwMaFEXE'),
};
var FARM_PROGRAM_IDS = {
  ['mainnet' /* MAINNET */]: new web3_js.PublicKey('FARMr8rFJohG2CXFWKKmj8Z3XAhZNdYZ5CE3TKeWpump'),
  ['devnet' /* DEVNET */]: new web3_js.PublicKey('SFFxHvYKTBgC7XYEZDua6m28NZo9fNnDRCEtM7AHR4m'),
};
var SWAP_ACCOUNT_SIZE = 324;
var DEFAULT_FEES = {
  tradeFeeNumerator: new BN__default.default(0),
  tradeFeeDenominator: new BN__default.default(1e4),
  ownerTradeFeeNumerator: new BN__default.default(30),
  ownerTradeFeeDenominator: new BN__default.default(1e4),
  ownerWithdrawFeeNumerator: new BN__default.default(0),
  ownerWithdrawFeeDenominator: new BN__default.default(0),
  hostFeeNumerator: new BN__default.default(20),
  hostFeeDenominator: new BN__default.default(100),
};
var CURVE_TYPE_MAP = {
  ['ConstantProduct' /* ConstantProduct */]: { constantProduct: {} },
  ['ConstantPrice' /* ConstantPrice */]: { constantPrice: {} },
  ['Stable' /* Stable */]: { stable: {} },
  ['Offset' /* Offset */]: { offset: {} },
};
var DEFAULT_SWAP_CALCULATOR = Array.from(new Uint8Array(32));

// src/constants/idl/amm.json
var amm_default = {
  address: 'SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr',
  metadata: {
    name: 'saros-swap',
    version: '2.2.0',
    spec: '2.2.0',
    description: 'Saros AMM',
  },
  instructions: [
    {
      name: 'initialize',
      discriminator: [0],
      accounts: [
        {
          name: 'swap_info',
          writable: true,
          signer: true,
        },
        {
          name: 'authority_info',
        },
        {
          name: 'token_a_info',
        },
        {
          name: 'token_b_info',
        },
        {
          name: 'pool_mint_info',
          writable: true,
        },
        {
          name: 'fee_account_info',
          writable: true,
        },
        {
          name: 'destination_info',
          writable: true,
        },
        {
          name: 'token_program_info',
        },
      ],
      args: [
        {
          name: 'fees',
          type: {
            defined: {
              name: 'Fees',
            },
          },
        },
        {
          name: 'swap_curve',
          type: {
            defined: {
              name: 'SwapCurve',
            },
          },
        },
        {
          name: 'swap_calculator',
          type: {
            array: ['u8', 32],
          },
        },
      ],
    },
    {
      name: 'swap',
      discriminator: [1],
      accounts: [
        {
          name: 'swap_info',
          writable: true,
        },
        {
          name: 'authority_info',
          writable: true,
        },
        {
          name: 'user_transfer_authority_info',
          writable: true,
          signer: true,
        },
        {
          name: 'source_info',
          writable: true,
        },
        {
          name: 'swap_source_info',
          writable: true,
        },
        {
          name: 'swap_destination_info',
          writable: true,
        },
        {
          name: 'destination_info',
          writable: true,
        },
        {
          name: 'pool_mint_info',
          writable: true,
        },
        {
          name: 'pool_fee_account_info',
          writable: true,
        },
        {
          name: 'token_program_info',
        },
      ],
      args: [
        {
          name: 'amount_in',
          type: 'u64',
        },
        {
          name: 'minimum_amount_out',
          type: 'u64',
        },
      ],
    },
    {
      name: 'deposit_all_token_types',
      discriminator: [2],
      accounts: [
        {
          name: 'swap_info',
        },
        {
          name: 'authority_info',
        },
        {
          name: 'user_transfer_authority_info',
          writable: true,
          signer: true,
        },
        {
          name: 'source_a_info',
          writable: true,
        },
        {
          name: 'source_b_info',
          writable: true,
        },
        {
          name: 'token_a_info',
          writable: true,
        },
        {
          name: 'token_b_info',
          writable: true,
        },
        {
          name: 'pool_mint_info',
          writable: true,
        },
        {
          name: 'dest_info',
          writable: true,
        },
        {
          name: 'token_program_info',
        },
      ],
      args: [
        {
          name: 'pool_token_amount',
          type: 'u64',
        },
        {
          name: 'maximum_token_a_amount',
          type: 'u64',
        },
        {
          name: 'maximum_token_b_amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdraw_all_token_types',
      discriminator: [3],
      accounts: [
        {
          name: 'swap_info',
        },
        {
          name: 'authority_info',
        },
        {
          name: 'user_transfer_authority_info',
          writable: true,
          signer: true,
        },
        {
          name: 'pool_mint_info',
          writable: true,
        },
        {
          name: 'source_info',
          writable: true,
        },
        {
          name: 'token_a_info',
          writable: true,
        },
        {
          name: 'token_b_info',
          writable: true,
        },
        {
          name: 'dest_token_a_info',
          writable: true,
        },
        {
          name: 'dest_token_b_info',
          writable: true,
        },
        {
          name: 'pool_fee_account_info',
          writable: true,
        },
        {
          name: 'token_program_info',
        },
      ],
      args: [
        {
          name: 'pool_token_amount',
          type: 'u64',
        },
        {
          name: 'minimum_token_a_amount',
          type: 'u64',
        },
        {
          name: 'minimum_token_b_amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'swap_exact_out',
      discriminator: [6],
      accounts: [
        {
          name: 'swap_info',
          writable: true,
        },
        {
          name: 'authority_info',
          writable: true,
        },
        {
          name: 'user_transfer_authority_info',
          writable: true,
          signer: true,
        },
        {
          name: 'source_info',
          writable: true,
        },
        {
          name: 'swap_source_info',
          writable: true,
        },
        {
          name: 'swap_destination_info',
          writable: true,
        },
        {
          name: 'destination_info',
          writable: true,
        },
        {
          name: 'pool_mint_info',
          writable: true,
        },
        {
          name: 'pool_fee_account_info',
          writable: true,
        },
        {
          name: 'token_program_info',
        },
      ],
      args: [
        {
          name: 'amount_out',
          type: 'u64',
        },
        {
          name: 'maximum_amount_in',
          type: 'u64',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'Pair',
      discriminator: [],
    },
  ],
  types: [
    {
      name: 'Pair',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'version',
            type: 'u8',
          },
          {
            name: 'is_initialized',
            type: 'bool',
          },
          {
            name: 'bump_seed',
            type: 'u8',
          },
          {
            name: 'token_program_id',
            type: 'pubkey',
          },
          {
            name: 'token_a',
            type: 'pubkey',
          },
          {
            name: 'token_b',
            type: 'pubkey',
          },
          {
            name: 'pool_mint',
            type: 'pubkey',
          },
          {
            name: 'token_a_mint',
            type: 'pubkey',
          },
          {
            name: 'token_b_mint',
            type: 'pubkey',
          },
          {
            name: 'pool_fee_account',
            type: 'pubkey',
          },
          {
            name: 'fees',
            type: {
              defined: {
                name: 'Fees',
              },
            },
          },
          {
            name: 'swap_curve',
            type: {
              defined: {
                name: 'SwapCurve',
              },
            },
          },
        ],
      },
    },
    {
      name: 'Fees',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'trade_fee_numerator',
            type: 'u64',
          },
          {
            name: 'trade_fee_denominator',
            type: 'u64',
          },
          {
            name: 'owner_trade_fee_numerator',
            type: 'u64',
          },
          {
            name: 'owner_trade_fee_denominator',
            type: 'u64',
          },
          {
            name: 'owner_withdraw_fee_numerator',
            type: 'u64',
          },
          {
            name: 'owner_withdraw_fee_denominator',
            type: 'u64',
          },
          {
            name: 'host_fee_numerator',
            type: 'u64',
          },
          {
            name: 'host_fee_denominator',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'SwapCurve',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'ConstantProduct',
          },
          {
            name: 'ConstantPrice',
          },
          {
            name: 'Stable',
          },
          {
            name: 'Offset',
          },
        ],
      },
    },
  ],
};

// src/services/base/index.ts
var SarosBaseService = class {
  constructor(config) {
    this.config = config;
    this.connection = config.connection;
    const provider = new anchor.AnchorProvider(this.connection, {}, anchor.AnchorProvider.defaultOptions());
    const programId = AMM_PROGRAM_IDS[config.mode];
    this.ammProgram = new anchor.Program({ ...amm_default, address: programId.toBase58() }, provider);
  }
  getDexName() {
    return 'Saros AMM';
  }
  getDexProgramId() {
    return this.ammProgram.programId;
  }
};

// src/utils/calculations.ts
function calculateSwapOutput(amountIn, reserveIn, reserveOut, tradeFeeNumerator, tradeFeeDenominator) {
  if (reserveIn === 0n || reserveOut === 0n) {
    return 0n;
  }
  const feeMultiplier = tradeFeeDenominator - tradeFeeNumerator;
  const amountInWithFee = amountIn * feeMultiplier;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * tradeFeeDenominator + amountInWithFee;
  return numerator / denominator;
}
function calculatePriceImpact(amountIn, amountOut, reserveIn, reserveOut) {
  if (reserveIn === 0n || reserveOut === 0n) {
    return 0;
  }
  const priceBefore = Number(reserveOut) / Number(reserveIn);
  const newReserveIn = reserveIn + amountIn;
  const newReserveOut = reserveOut - amountOut;
  const priceAfter = Number(newReserveOut) / Number(newReserveIn);
  return Math.abs(((priceAfter - priceBefore) / priceBefore) * 100);
}
function getMinOutputWithSlippage(amount, slippagePercent) {
  const slippageBps = BigInt(Math.floor(slippagePercent * 100));
  return (amount * (10000n - slippageBps)) / 10000n;
}
function derivePoolAuthority(poolPubkey, programId) {
  return web3_js.PublicKey.findProgramAddressSync([poolPubkey.toBuffer()], programId);
}
function deriveFarmUserPoolAddress(user, poolAddress, programId) {
  return web3_js.PublicKey.findProgramAddressSync([user.toBuffer(), poolAddress.toBuffer()], programId);
}
function deriveFarmUserPoolRewardAddress(user, poolReward, programId) {
  return web3_js.PublicKey.findProgramAddressSync([user.toBuffer(), poolReward.toBuffer()], programId);
}
function deriveFarmPoolAuthority(poolAddress, programId) {
  return web3_js.PublicKey.findProgramAddressSync([Buffer.from('authority'), poolAddress.toBuffer()], programId);
}
function deriveFarmPoolRewardAuthority(poolReward, programId) {
  return web3_js.PublicKey.findProgramAddressSync([Buffer.from('authority'), poolReward.toBuffer()], programId);
}

// src/utils/errors.ts
var SarosAMMErrorCode = /* @__PURE__ */ ((SarosAMMErrorCode2) => {
  SarosAMMErrorCode2['InvalidTokenAmount'] = 'INVALID_TOKEN_AMOUNT';
  SarosAMMErrorCode2['InvalidDecimals'] = 'INVALID_DECIMALS';
  SarosAMMErrorCode2['PairNotInitialized'] = 'PAIR_NOT_INITIALIZED';
  SarosAMMErrorCode2['PairFetchFailed'] = 'PAIR_FETCH_FAILED';
  SarosAMMErrorCode2['PairCreationFailed'] = 'PAIR_CREATION_FAILED';
  SarosAMMErrorCode2['SwapFailed'] = 'SWAP_FAILED';
  SarosAMMErrorCode2['AddLiquidityFailed'] = 'ADD_LIQUIDITY_FAILED';
  SarosAMMErrorCode2['RemoveLiquidityFailed'] = 'REMOVE_LIQUIDITY_FAILED';
  SarosAMMErrorCode2['QuoteCalculationFailed'] = 'QUOTE_CALCULATION_FAILED';
  SarosAMMErrorCode2['ZeroAmount'] = 'ZERO_AMOUNT';
  SarosAMMErrorCode2['InvalidSlippage'] = 'INVALID_SLIPPAGE';
  SarosAMMErrorCode2['InsufficientLiquidity'] = 'INSUFFICIENT_LIQUIDITY';
  SarosAMMErrorCode2['InvalidTokenAccount'] = 'INVALID_TOKEN_ACCOUNT';
  SarosAMMErrorCode2['PoolNotInitialized'] = 'POOL_NOT_INITIALIZED';
  SarosAMMErrorCode2['PoolFetchFailed'] = 'POOL_FETCH_FAILED';
  return SarosAMMErrorCode2;
})(SarosAMMErrorCode || {});
var SarosAMMError = class _SarosAMMError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = 'SarosAMMError';
  }
  static InvalidTokenAmount(value) {
    const msg = value ? `Invalid token amount: ${value}` : 'Invalid token amount';
    return new _SarosAMMError(msg, 'INVALID_TOKEN_AMOUNT' /* InvalidTokenAmount */);
  }
  static InvalidDecimals(decimals) {
    const msg = decimals !== void 0 ? `Invalid decimals: ${decimals}` : 'Invalid decimals';
    return new _SarosAMMError(msg, 'INVALID_DECIMALS' /* InvalidDecimals */);
  }
  static PairNotInitialized() {
    return new _SarosAMMError('Pair is not initialized', 'PAIR_NOT_INITIALIZED' /* PairNotInitialized */);
  }
  static PairFetchFailed() {
    return new _SarosAMMError('Failed to fetch pair account', 'PAIR_FETCH_FAILED' /* PairFetchFailed */);
  }
  static PairCreationFailed() {
    return new _SarosAMMError('Failed to create pair', 'PAIR_CREATION_FAILED' /* PairCreationFailed */);
  }
  static SwapFailed() {
    return new _SarosAMMError('Failed to build swap transaction', 'SWAP_FAILED' /* SwapFailed */);
  }
  static AddLiquidityFailed() {
    return new _SarosAMMError(
      'Failed to build add liquidity transaction',
      'ADD_LIQUIDITY_FAILED' /* AddLiquidityFailed */
    );
  }
  static RemoveLiquidityFailed() {
    return new _SarosAMMError(
      'Failed to build remove liquidity transaction',
      'REMOVE_LIQUIDITY_FAILED' /* RemoveLiquidityFailed */
    );
  }
  static QuoteCalculationFailed() {
    return new _SarosAMMError('Failed to calculate quote', 'QUOTE_CALCULATION_FAILED' /* QuoteCalculationFailed */);
  }
  static ZeroAmount() {
    return new _SarosAMMError('Amount must be greater than zero', 'ZERO_AMOUNT' /* ZeroAmount */);
  }
  static InvalidSlippage() {
    return new _SarosAMMError('Slippage must be between 0 and 100', 'INVALID_SLIPPAGE' /* InvalidSlippage */);
  }
  static InsufficientLiquidity() {
    return new _SarosAMMError('Insufficient liquidity in pool', 'INSUFFICIENT_LIQUIDITY' /* InsufficientLiquidity */);
  }
  static PoolNotInitialized() {
    return new _SarosAMMError(
      'Pool state not loaded. Call refreshState() first',
      'POOL_NOT_INITIALIZED' /* PoolNotInitialized */
    );
  }
  static PoolFetchFailed(poolType = 'pool') {
    return new _SarosAMMError(`Failed to refresh ${poolType} state`, 'POOL_FETCH_FAILED' /* PoolFetchFailed */);
  }
  static handleError(error, fallback) {
    if (error instanceof _SarosAMMError) {
      throw error;
    }
    throw fallback;
  }
};

// src/utils/legacyAccountDecoder.ts
var borsh = __toESM(require_dist());
var tokenSwapLayout = borsh.struct([
  borsh.u8('version'),
  borsh.u8('isInitialized'),
  borsh.u8('bumpSeed'),
  borsh.publicKey('tokenProgramId'),
  borsh.publicKey('tokenAccountA'),
  // tokenA
  borsh.publicKey('tokenAccountB'),
  // tokenB
  borsh.publicKey('tokenPool'),
  // poolMint
  borsh.publicKey('mintA'),
  // tokenAMint
  borsh.publicKey('mintB'),
  // tokenBMint
  borsh.publicKey('feeAccount'),
  // poolFeeAccount
  borsh.u64('tradeFeeNumerator'),
  borsh.u64('tradeFeeDenominator'),
  borsh.u64('ownerTradeFeeNumerator'),
  borsh.u64('ownerTradeFeeDenominator'),
  borsh.u64('ownerWithdrawFeeNumerator'),
  borsh.u64('ownerWithdrawFeeDenominator'),
  borsh.u64('hostFeeNumerator'),
  borsh.u64('hostFeeDenominator'),
  borsh.u8('curveType'),
  borsh.vecU8('curveParameters'),
]);
function decodePairAccount(data) {
  try {
    const decoded = tokenSwapLayout.decode(data);
    return {
      version: decoded.version,
      isInitialized: decoded.isInitialized !== 0,
      bumpSeed: decoded.bumpSeed,
      tokenProgramId: new web3_js.PublicKey(decoded.tokenProgramId),
      tokenA: new web3_js.PublicKey(decoded.tokenAccountA),
      tokenB: new web3_js.PublicKey(decoded.tokenAccountB),
      poolMint: new web3_js.PublicKey(decoded.tokenPool),
      tokenAMint: new web3_js.PublicKey(decoded.mintA),
      tokenBMint: new web3_js.PublicKey(decoded.mintB),
      poolFeeAccount: new web3_js.PublicKey(decoded.feeAccount),
      fees: {
        tradeFeeNumerator: new anchor.BN(decoded.tradeFeeNumerator.toString()),
        tradeFeeDenominator: new anchor.BN(decoded.tradeFeeDenominator.toString()),
        ownerTradeFeeNumerator: new anchor.BN(decoded.ownerTradeFeeNumerator.toString()),
        ownerTradeFeeDenominator: new anchor.BN(decoded.ownerTradeFeeDenominator.toString()),
        ownerWithdrawFeeNumerator: new anchor.BN(decoded.ownerWithdrawFeeNumerator.toString()),
        ownerWithdrawFeeDenominator: new anchor.BN(decoded.ownerWithdrawFeeDenominator.toString()),
        hostFeeNumerator: new anchor.BN(decoded.hostFeeNumerator.toString()),
        hostFeeDenominator: new anchor.BN(decoded.hostFeeDenominator.toString()),
      },
      swapCurve: decodeCurveType(decoded.curveType),
    };
  } catch (error) {
    throw new Error(`Failed to decode Pair account: ${error}`);
  }
}
function decodeCurveType(curveType) {
  switch (curveType) {
    case 0:
      return { constantProduct: {} };
    case 1:
      return { constantPrice: {} };
    case 2:
      return { stable: {} };
    case 3:
      return { offset: {} };
    default:
      return { constantProduct: {} };
  }
}

// src/services/pair.ts
var SarosAMMPair = class extends SarosBaseService {
  constructor(config, pairAddress) {
    super(config);
    this.pairAddress = pairAddress;
  }
  /**
   * Get the pair address
   */
  getPairAddress() {
    return this.pairAddress;
  }
  /**
   * Get the pair account data
   */
  getPairAccount() {
    if (!this.pairAccount) {
      throw SarosAMMError.PairNotInitialized();
    }
    return this.pairAccount;
  }
  /**
   * Get the pair metadata
   */
  getPairMetadata() {
    if (!this.metadata) {
      throw SarosAMMError.PairNotInitialized();
    }
    return this.metadata;
  }
  /**
   * Fetch and refresh pair state from chain
   */
  async refreshState() {
    try {
      const accountInfo = await this.connection.getAccountInfo(this.pairAddress);
      if (!accountInfo) {
        throw SarosAMMError.PairFetchFailed();
      }
      this.pairAccount = decodePairAccount(accountInfo.data);
      const [poolAuthority] = derivePoolAuthority(this.pairAddress, this.ammProgram.programId);
      this.poolAuthority = poolAuthority;
      this.metadata = await this.buildPairMetadata();
    } catch (error) {
      SarosAMMError.handleError(error, SarosAMMError.PairFetchFailed());
    }
  }
  /**
   * Get a quote for a swap
   */
  async getQuote(params) {
    if (params.amount <= 0n) throw SarosAMMError.ZeroAmount();
    if (params.slippage < 0 || params.slippage >= 100) {
      throw SarosAMMError.InvalidSlippage();
    }
    try {
      const { amount, swapForY, slippage } = params;
      const { tokenX, tokenY } = this.metadata;
      if (!tokenX.reserve || !tokenY.reserve) {
        throw SarosAMMError.PairNotInitialized();
      }
      const reserveIn = swapForY ? tokenX.reserve : tokenY.reserve;
      const reserveOut = swapForY ? tokenY.reserve : tokenX.reserve;
      const { tradeFeeNumerator, tradeFeeDenominator } = this.pairAccount.fees;
      const amountOut = calculateSwapOutput(
        amount,
        reserveIn,
        reserveOut,
        BigInt(tradeFeeNumerator.toString()),
        BigInt(tradeFeeDenominator.toString())
      );
      const minAmountOut = getMinOutputWithSlippage(amountOut, slippage);
      const priceImpact = calculatePriceImpact(amount, amountOut, reserveIn, reserveOut);
      const rate = Number(amountOut) / Number(amount);
      return {
        amountIn: amount,
        amountOut,
        minAmountOut,
        priceImpact,
        rate,
      };
    } catch (error) {
      SarosAMMError.handleError(error, SarosAMMError.QuoteCalculationFailed());
    }
  }
  /**
   * Execute a swap transaction
   */
  async swap(params) {
    try {
      const { amount, minAmountOut, swapForY, payer, transaction } = params;
      if (amount <= 0n) throw SarosAMMError.ZeroAmount();
      if (minAmountOut < 0n) throw SarosAMMError.InvalidSlippage();
      const tx = transaction || new web3_js.Transaction();
      const { tokenAMint, tokenBMint, tokenA, tokenB, poolMint } = this.pairAccount;
      const userTokenA =
        params.userTokenX || (await spl2__namespace.getAssociatedTokenAddress(tokenAMint, payer, true));
      const userTokenB =
        params.userTokenY || (await spl2__namespace.getAssociatedTokenAddress(tokenBMint, payer, true));
      const [sourceToken, destToken, poolSource, poolDest] = swapForY
        ? [userTokenA, userTokenB, tokenA, tokenB]
        : [userTokenB, userTokenA, tokenB, tokenA];
      const swapIx = await this.ammProgram.methods
        .swap(new anchor.BN(amount.toString()), new anchor.BN(minAmountOut.toString()))
        .accountsPartial({
          swapInfo: this.pairAddress,
          authorityInfo: this.poolAuthority,
          userTransferAuthorityInfo: payer,
          sourceInfo: sourceToken,
          swapSourceInfo: poolSource,
          swapDestinationInfo: poolDest,
          destinationInfo: destToken,
          poolMintInfo: poolMint,
          poolFeeAccountInfo: this.pairAccount.poolFeeAccount,
          tokenProgramInfo: spl2__namespace.TOKEN_PROGRAM_ID,
        })
        .instruction();
      tx.add(swapIx);
      return tx;
    } catch (error) {
      SarosAMMError.handleError(error, SarosAMMError.SwapFailed());
    }
  }
  /**
   * Add liquidity to an existing pool
   *
   * Calculates required token amounts based on current pool ratios and creates
   * a transaction to deposit tokens and mint LP tokens.
   */
  async addLiquidity(params) {
    try {
      const { poolTokenAmount, maximumTokenA, maximumTokenB, payer, transaction } = params;
      if (poolTokenAmount <= 0n) throw SarosAMMError.ZeroAmount();
      if (maximumTokenA <= 0n || maximumTokenB <= 0n) throw SarosAMMError.InvalidSlippage();
      const tx = transaction || new web3_js.Transaction();
      const { tokenAMint, tokenBMint, tokenA, tokenB, poolMint } = this.pairAccount;
      const userTokenA =
        params.userTokenX || (await spl2__namespace.getAssociatedTokenAddress(tokenAMint, payer, true));
      const userTokenB =
        params.userTokenY || (await spl2__namespace.getAssociatedTokenAddress(tokenBMint, payer, true));
      const userLpToken =
        params.userLpToken || (await spl2__namespace.getAssociatedTokenAddress(poolMint, payer, true));
      const depositIx = await this.ammProgram.methods
        .depositAllTokenTypes(
          new anchor.BN(poolTokenAmount.toString()),
          new anchor.BN(maximumTokenA.toString()),
          new anchor.BN(maximumTokenB.toString())
        )
        .accountsPartial({
          swapInfo: this.pairAddress,
          authorityInfo: this.poolAuthority,
          userTransferAuthorityInfo: payer,
          sourceAInfo: userTokenA,
          sourceBInfo: userTokenB,
          tokenAInfo: tokenA,
          tokenBInfo: tokenB,
          poolMintInfo: poolMint,
          destInfo: userLpToken,
          tokenProgramInfo: spl2__namespace.TOKEN_PROGRAM_ID,
        })
        .instruction();
      tx.add(depositIx);
      return tx;
    } catch (error) {
      SarosAMMError.handleError(error, SarosAMMError.AddLiquidityFailed());
    }
  }
  /**
   * Remove liquidity from a pool
   *
   * Burns LP tokens and withdraws proportional amounts of underlying tokens.
   */
  async removeLiquidity(params) {
    try {
      const { poolTokenAmount, minimumTokenA, minimumTokenB, payer, transaction } = params;
      if (poolTokenAmount <= 0n) throw SarosAMMError.ZeroAmount();
      if (minimumTokenA < 0n || minimumTokenB < 0n) throw SarosAMMError.InvalidSlippage();
      const tx = transaction || new web3_js.Transaction();
      const { tokenAMint, tokenBMint, tokenA, tokenB, poolMint, poolFeeAccount } = this.pairAccount;
      const userTokenA =
        params.userTokenX || (await spl2__namespace.getAssociatedTokenAddress(tokenAMint, payer, true));
      const userTokenB =
        params.userTokenY || (await spl2__namespace.getAssociatedTokenAddress(tokenBMint, payer, true));
      const userLpToken =
        params.userLpToken || (await spl2__namespace.getAssociatedTokenAddress(poolMint, payer, true));
      const withdrawIx = await this.ammProgram.methods
        .withdrawAllTokenTypes(
          new anchor.BN(poolTokenAmount.toString()),
          new anchor.BN(minimumTokenA.toString()),
          new anchor.BN(minimumTokenB.toString())
        )
        .accountsPartial({
          swapInfo: this.pairAddress,
          authorityInfo: this.poolAuthority,
          userTransferAuthorityInfo: payer,
          poolMintInfo: poolMint,
          sourceInfo: userLpToken,
          tokenAInfo: tokenA,
          tokenBInfo: tokenB,
          destTokenAInfo: userTokenA,
          destTokenBInfo: userTokenB,
          poolFeeAccountInfo: poolFeeAccount,
          tokenProgramInfo: spl2__namespace.TOKEN_PROGRAM_ID,
        })
        .instruction();
      tx.add(withdrawIx);
      return tx;
    } catch (error) {
      SarosAMMError.handleError(error, SarosAMMError.RemoveLiquidityFailed());
    }
  }
  async buildPairMetadata() {
    const { tokenAMint, tokenBMint, tokenA, tokenB, poolMint, poolFeeAccount, fees, swapCurve } = this.pairAccount;
    const [tokenAInfo, tokenBInfo] = await Promise.all([
      this.connection.getAccountInfo(tokenA),
      this.connection.getAccountInfo(tokenB),
    ]);
    const tokenAData = tokenAInfo ? spl2__namespace.AccountLayout.decode(tokenAInfo.data) : null;
    const tokenBData = tokenBInfo ? spl2__namespace.AccountLayout.decode(tokenBInfo.data) : null;
    const [mintAInfo, mintBInfo, poolMintInfo] = await Promise.all([
      spl2__namespace.getMint(this.connection, tokenAMint),
      spl2__namespace.getMint(this.connection, tokenBMint),
      spl2__namespace.getMint(this.connection, poolMint),
    ]);
    const curveType = this.getCurveType(swapCurve);
    return {
      pair: this.pairAddress,
      tokenX: {
        mint: tokenAMint,
        decimals: mintAInfo.decimals,
        reserve: tokenAData ? BigInt(tokenAData.amount.toString()) : 0n,
      },
      tokenY: {
        mint: tokenBMint,
        decimals: mintBInfo.decimals,
        reserve: tokenBData ? BigInt(tokenBData.amount.toString()) : 0n,
      },
      lpToken: {
        mint: poolMint,
        decimals: poolMintInfo.decimals,
      },
      feeAccount: poolFeeAccount,
      curve: curveType,
      fees: this.calculateFeePercentages(fees),
    };
  }
  getCurveType(curve) {
    if ('constantProduct' in curve) return 'ConstantProduct' /* ConstantProduct */;
    if ('constantPrice' in curve) return 'ConstantPrice' /* ConstantPrice */;
    if ('stable' in curve) return 'Stable' /* Stable */;
    if ('offset' in curve) return 'Offset' /* Offset */;
    return 'ConstantProduct' /* ConstantProduct */;
  }
  calculateFeePercentages(fees) {
    const calcFee = (numerator, denominator) => {
      const denom = Number(denominator);
      return denom === 0 ? 0 : (Number(numerator) / denom) * 100;
    };
    return {
      tradeFee: calcFee(fees.tradeFeeNumerator, fees.tradeFeeDenominator),
      ownerTradeFee: calcFee(fees.ownerTradeFeeNumerator, fees.ownerTradeFeeDenominator),
      ownerWithdrawFee: calcFee(fees.ownerWithdrawFeeNumerator, fees.ownerWithdrawFeeDenominator),
      hostFee: calcFee(fees.hostFeeNumerator, fees.hostFeeDenominator),
    };
  }
};
async function buildCreatePairTransaction(args) {
  const { connection, ammProgram, params } = args;
  const { payer, tokenAMint, tokenBMint, curveType, initialTokenAAmount, initialTokenBAmount } = params;
  const feeOwner = params.feeOwner ?? SAROS_FEE_OWNER;
  const swapInfoKeypair = web3_js.Keypair.generate();
  const lpMintKeypair = web3_js.Keypair.generate();
  const [poolAuthority] = derivePoolAuthority(swapInfoKeypair.publicKey, ammProgram.programId);
  const poolTokenA = await spl2__namespace.getAssociatedTokenAddress(tokenAMint, poolAuthority, true);
  const poolTokenB = await spl2__namespace.getAssociatedTokenAddress(tokenBMint, poolAuthority, true);
  const userLpTokenAccount = await spl2__namespace.getAssociatedTokenAddress(lpMintKeypair.publicKey, payer);
  const feeAccount = await spl2__namespace.getAssociatedTokenAddress(lpMintKeypair.publicKey, feeOwner);
  const userTokenA = await spl2__namespace.getAssociatedTokenAddress(tokenAMint, payer);
  const userTokenB = await spl2__namespace.getAssociatedTokenAddress(tokenBMint, payer);
  const shouldCreateFeeAccountAta = !feeAccount.equals(userLpTokenAccount);
  const [swapAccountRent, mintRent, { blockhash }] = await Promise.all([
    connection.getMinimumBalanceForRentExemption(SWAP_ACCOUNT_SIZE),
    connection.getMinimumBalanceForRentExemption(spl2__namespace.MINT_SIZE),
    connection.getLatestBlockhash(),
  ]);
  const tx = new web3_js.Transaction();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer;
  tx.add(
    web3_js.SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: lpMintKeypair.publicKey,
      space: spl2__namespace.MINT_SIZE,
      lamports: mintRent,
      programId: spl2__namespace.TOKEN_PROGRAM_ID,
    }),
    spl2__namespace.createInitializeMintInstruction(lpMintKeypair.publicKey, 2, poolAuthority, null)
  );
  tx.add(
    spl2__namespace.createAssociatedTokenAccountInstruction(payer, poolTokenA, poolAuthority, tokenAMint),
    spl2__namespace.createAssociatedTokenAccountInstruction(payer, poolTokenB, poolAuthority, tokenBMint)
  );
  tx.add(
    spl2__namespace.createAssociatedTokenAccountIdempotentInstruction(
      payer,
      userLpTokenAccount,
      payer,
      lpMintKeypair.publicKey
    )
  );
  if (shouldCreateFeeAccountAta) {
    tx.add(
      spl2__namespace.createAssociatedTokenAccountIdempotentInstruction(
        payer,
        feeAccount,
        feeOwner,
        lpMintKeypair.publicKey
      )
    );
  }
  tx.add(
    spl2__namespace.createTransferInstruction(userTokenA, poolTokenA, payer, initialTokenAAmount),
    spl2__namespace.createTransferInstruction(userTokenB, poolTokenB, payer, initialTokenBAmount)
  );
  tx.add(
    web3_js.SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: swapInfoKeypair.publicKey,
      space: SWAP_ACCOUNT_SIZE,
      lamports: swapAccountRent,
      programId: ammProgram.programId,
    })
  );
  const initIx = await ammProgram.methods
    .initialize(DEFAULT_FEES, CURVE_TYPE_MAP[curveType], DEFAULT_SWAP_CALCULATOR)
    .accounts({
      swapInfo: swapInfoKeypair.publicKey,
      authorityInfo: poolAuthority,
      tokenAInfo: poolTokenA,
      tokenBInfo: poolTokenB,
      poolMintInfo: lpMintKeypair.publicKey,
      feeAccountInfo: feeAccount,
      destinationInfo: userLpTokenAccount,
      tokenProgramInfo: spl2__namespace.TOKEN_PROGRAM_ID,
    })
    .instruction();
  tx.add(initIx);
  const signers = [lpMintKeypair, swapInfoKeypair];
  return {
    transaction: tx,
    pairAddress: swapInfoKeypair.publicKey,
    lpTokenMint: lpMintKeypair.publicKey,
    pairKeypair: swapInfoKeypair,
    lpMintKeypair,
    poolTokenA,
    poolTokenB,
    feeAccount,
    pairAuthority: poolAuthority,
    signers,
  };
}

// src/services/index.ts
var TOKEN_A_MINT_OFFSET = 131;
var TOKEN_B_MINT_OFFSET = TOKEN_A_MINT_OFFSET + 32;
var SarosAMM = class extends SarosBaseService {
  constructor(config) {
    super(config);
  }
  /**
   * Create a new Saros AMM pair.
   * Returns an unsigned transaction plus helper metadata for signing and sending.
   */
  async createPair(params) {
    try {
      return await buildCreatePairTransaction({
        connection: this.connection,
        ammProgram: this.ammProgram,
        params,
      });
    } catch (error) {
      SarosAMMError.handleError(error, SarosAMMError.PairCreationFailed());
    }
  }
  /**
   * Instantiate a SarosAMMPair for the provided pair address.
   */
  async getPair(pairAddress) {
    const pair = new SarosAMMPair(this.config, pairAddress);
    await pair.refreshState();
    return pair;
  }
  /**
   * Batch helper for fetching multiple pairs in parallel.
   */
  async getPairs(pairAddresses) {
    return Promise.all(pairAddresses.map((address) => this.getPair(address)));
  }
  /**
   * Discover every Saros AMM pair on the configured cluster.
   */
  async getAllPairAddresses() {
    const accounts = await this.connection.getProgramAccounts(this.getDexProgramId(), {
      filters: [{ dataSize: SWAP_ACCOUNT_SIZE }],
    });
    return accounts.map((acc) => acc.pubkey.toBase58());
  }
  /**
   * Find pairs that contain a token mint. Optionally restrict the search to a
   * specific pair by supplying `mintB`.
   */
  async findPairs(mintA, mintB) {
    const programId = this.getDexProgramId();
    const filters = [{ dataSize: SWAP_ACCOUNT_SIZE }];
    const [accountsX, accountsY] = await Promise.all([
      this.connection.getProgramAccounts(programId, {
        filters: [{ memcmp: { offset: TOKEN_A_MINT_OFFSET, bytes: mintA.toBase58() } }, ...filters],
      }),
      this.connection.getProgramAccounts(programId, {
        filters: [{ memcmp: { offset: TOKEN_B_MINT_OFFSET, bytes: mintA.toBase58() } }, ...filters],
      }),
    ]);
    const deduped = /* @__PURE__ */ new Map();
    [...accountsX, ...accountsY].forEach((account) => {
      deduped.set(account.pubkey.toBase58(), account.account.data);
    });
    let matches = Array.from(deduped.entries());
    if (mintB) {
      matches = matches.filter(([, data]) => {
        const tokenAMint = new web3_js.PublicKey(data.slice(TOKEN_A_MINT_OFFSET, TOKEN_A_MINT_OFFSET + 32));
        const tokenBMint = new web3_js.PublicKey(data.slice(TOKEN_B_MINT_OFFSET, TOKEN_B_MINT_OFFSET + 32));
        return (
          (tokenAMint.equals(mintA) && tokenBMint.equals(mintB)) ||
          (tokenAMint.equals(mintB) && tokenBMint.equals(mintA))
        );
      });
    }
    return matches.map(([address]) => address);
  }
};

// src/constants/idl/farm.ts
var FARM_IDL = {
  address: 'FARMr8rFJohG2CXFWKKmj8Z3XAhZNdYZ5CE3TKeWpump',
  metadata: {
    name: 'saros_farm',
    version: '0.1.0',
    spec: '0.1.0',
  },
  version: '0.1.0',
  name: 'saros_farm',
  instructions: [
    {
      name: 'createPool',
      accounts: [
        {
          name: 'root',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'Pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'poolPath',
          type: 'bytes',
        },
        {
          name: 'poolNonce',
          type: 'u8',
        },
        {
          name: 'poolAuthorityNonce',
          type: 'u8',
        },
        {
          name: 'stakingTokenMint',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'createPoolReward',
      accounts: [
        {
          name: 'root',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'Pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'PoolReward',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rootRewardTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'poolRewardTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'poolRewardNonce',
          type: 'u8',
        },
        {
          name: 'poolRewardAuthorityNonce',
          type: 'u8',
        },
        {
          name: 'rewardTokenMint',
          type: 'publicKey',
        },
        {
          name: 'rewardPerBlock',
          type: 'u128',
        },
        {
          name: 'rewardStartBlock',
          type: 'u64',
        },
        {
          name: 'rewardEndBlock',
          type: 'u64',
        },
      ],
    },
    {
      name: 'setPausePool',
      accounts: [
        {
          name: 'root',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'Pool',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'isPause',
          type: 'bool',
        },
      ],
    },
    {
      name: 'setPauseRewardPool',
      accounts: [
        {
          name: 'root',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'PoolReward',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'isPause',
          type: 'bool',
        },
      ],
    },
    {
      name: 'createUserPool',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'Pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userPool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'userPoolNonce',
          type: 'u8',
        },
      ],
    },
    {
      name: 'createUserPoolReward',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'PoolReward',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userPoolReward',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'userPoolRewardNonce',
          type: 'u8',
        },
      ],
    },
    {
      name: 'stakePool',
      accounts: [
        {
          name: 'Pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'poolStakingTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'userPool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStakingTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'stakePoolReward',
      accounts: [
        {
          name: 'Pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'PoolReward',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'userPool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userPoolReward',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'unstakePoolReward',
      accounts: [
        {
          name: 'Pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'PoolReward',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'userPool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userPoolReward',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'claimReward',
      accounts: [
        {
          name: 'PoolReward',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'poolRewardAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'poolRewardTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'userPoolReward',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userRewardTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'unstakePool',
      accounts: [
        {
          name: 'Pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'poolAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'poolStakingTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'userPool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStakingTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'updatePoolRewardParams',
      accounts: [
        {
          name: 'root',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'PoolReward',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rootRewardTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'poolRewardTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'newRewardPerBlock',
          type: 'u128',
        },
        {
          name: 'newStartBlock',
          type: 'u64',
        },
        {
          name: 'newEndBlock',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdrawRewardToken',
      accounts: [
        {
          name: 'root',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'PoolReward',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'from',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'to',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'Pool',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'nonce',
            type: 'u8',
          },
          {
            name: 'authorityNonce',
            type: 'u8',
          },
          {
            name: 'stakingTokenMint',
            type: 'publicKey',
          },
          {
            name: 'stakingTokenAccount',
            type: 'publicKey',
          },
          {
            name: 'state',
            type: {
              defined: 'PoolState',
            },
          },
        ],
      },
    },
    {
      name: 'PoolReward',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'nonce',
            type: 'u8',
          },
          {
            name: 'authorityNonce',
            type: 'u8',
          },
          {
            name: 'rewardTokenMint',
            type: 'publicKey',
          },
          {
            name: 'rewardTokenAccount',
            type: 'publicKey',
          },
          {
            name: 'rewardPerBlock',
            type: 'u128',
          },
          {
            name: 'rewardEndBlock',
            type: 'u64',
          },
          {
            name: 'totalShares',
            type: 'u64',
          },
          {
            name: 'accumulatedRewardPerShare',
            type: 'u128',
          },
          {
            name: 'lastUpdatedBlock',
            type: 'u64',
          },
          {
            name: 'totalClaimed',
            type: 'u64',
          },
          {
            name: 'state',
            type: {
              defined: 'PoolState',
            },
          },
        ],
      },
    },
    {
      name: 'UserPool',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'nonce',
            type: 'u8',
          },
          {
            name: 'amount',
            type: 'u64',
          },
          {
            name: 'totalStaked',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'UserPoolReward',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'nonce',
            type: 'u8',
          },
          {
            name: 'amount',
            type: 'u64',
          },
          {
            name: 'rewardDebt',
            type: 'u64',
          },
          {
            name: 'rewardPending',
            type: 'u64',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'TransferTokenParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'instruction',
            type: 'u8',
          },
          {
            name: 'amount',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'PoolState',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Paused',
          },
          {
            name: 'Unpaused',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'SetPausePoolEvent',
      fields: [
        {
          name: 'isPause',
          type: 'bool',
          index: false,
        },
      ],
    },
    {
      name: 'SetPauseRewardPoolEvent',
      fields: [
        {
          name: 'isPause',
          type: 'bool',
          index: false,
        },
      ],
    },
    {
      name: 'UpdatePoolRewardParamsEvent',
      fields: [
        {
          name: 'newRewardPerBlock',
          type: 'u128',
          index: false,
        },
        {
          name: 'newStartBlock',
          type: 'u64',
          index: false,
        },
        {
          name: 'newEndBlock',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'WithdrawRewardTokenEvent',
      fields: [
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6e3,
      name: 'InvalidOwner',
      msg: 'SarosFarm: Not an owner.',
    },
    {
      code: 6001,
      name: 'InvalidPoolLpTokenAccount',
      msg: 'SarosFarm: Invalid pool LP token account.',
    },
    {
      code: 6002,
      name: 'InvalidPoolRewardTokenAccount',
      msg: 'SarosFarm: Invalid reward token account.',
    },
    {
      code: 6003,
      name: 'InvalidWithdrawAmount',
      msg: 'SarosFarm: Invalid withdraw amount.',
    },
    {
      code: 6004,
      name: 'CantWithdrawNow',
      msg: 'SarosFarm: Cannot withdraw now.',
    },
    {
      code: 6005,
      name: 'TimeOverlap',
      msg: 'SarosFarm: Time overlap.',
    },
    {
      code: 6006,
      name: 'PoolWasPaused',
      msg: 'SarosFarm: Pool was paused.',
    },
    {
      code: 6007,
      name: 'UninitializedAccount',
      msg: 'SarosFarm: Uninitialized account.',
    },
  ],
};

// src/services/api.ts
var SAROS_API_BASE = 'https://api.saros.xyz/api/saros';
var SarosAPIService = class {
  static async fetchWithFallback(url, timeoutMs = 5e3) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });
      clearTimeout(timeout);
      if (!response.ok) {
        console.warn(`Saros API returned ${response.status} for ${url}`);
        return null;
      }
      const json = await response.json();
      if (!json.success || !Array.isArray(json.data)) {
        console.warn('Saros API returned invalid response format');
        return null;
      }
      return json.data;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`Saros API unavailable: ${error.message}`);
      }
      return null;
    }
  }
  /**
   * Fetch all farm information from Saros API
   * Returns null if API is unavailable
   */
  static async getFarmInfo(page = 1, size = 100) {
    const url = `${SAROS_API_BASE}/information?page=${page}&size=${size}&type=farm`;
    return this.fetchWithFallback(url);
  }
  /**
   * Fetch all stake information from Saros API
   * Returns null if API is unavailable
   */
  static async getStakeInfo(page = 1, size = 100) {
    const url = `${SAROS_API_BASE}/information?page=${page}&size=${size}&type=stake`;
    return this.fetchWithFallback(url);
  }
  /**
   * Fetch farm info for a specific pool address
   * Returns null if not found or API unavailable
   */
  static async getFarmByPool(poolAddress) {
    const farms = await this.getFarmInfo();
    if (!farms) return null;
    return farms.find((farm) => farm.poolAddress === poolAddress) || null;
  }
  /**
   * Fetch stake info for a specific pool address
   * Returns null if not found or API unavailable
   */
  static async getStakeByPool(poolAddress) {
    const stakes = await this.getStakeInfo();
    if (!stakes) return null;
    return stakes.find((stake) => stake.poolAddress === poolAddress) || null;
  }
};

// src/services/farm.ts
var SarosFarm = class {
  /**
   * Typed accessor for program accounts
   */
  get accounts() {
    return this.farmProgram.account;
  }
  constructor(config, poolAddress, poolType = 'farm') {
    this.config = config;
    this.connection = config.connection;
    this.poolAddress = poolAddress;
    this.poolType = poolType;
    const provider = new anchor.AnchorProvider(this.connection, {}, anchor.AnchorProvider.defaultOptions());
    const programId = FARM_PROGRAM_IDS[config.mode];
    this.farmProgram = new anchor.Program({ ...FARM_IDL, address: programId.toBase58() }, provider);
  }
  /**
   * Refresh pool state from on-chain and API
   */
  async refreshState() {
    try {
      const poolAccountData = await this.accounts.pool.fetch(this.poolAddress);
      this.poolAccount = {
        nonce: poolAccountData.nonce,
        authorityNonce: poolAccountData.authorityNonce,
        stakingTokenMint: poolAccountData.stakingTokenMint,
        stakingTokenAccount: poolAccountData.stakingTokenAccount,
        state: poolAccountData.state,
      };
      this.apiInfo =
        this.poolType === 'farm'
          ? (await SarosAPIService.getFarmByPool(this.poolAddress.toBase58())) || void 0
          : (await SarosAPIService.getStakeByPool(this.poolAddress.toBase58())) || void 0;
    } catch (_error) {
      throw SarosAMMError.PoolFetchFailed(this.poolType);
    }
  }
  /**
   * Get raw API info (direct from Saros API)
   */
  getApiInfo() {
    return this.apiInfo;
  }
  /**
   * Get pool account
   */
  getPoolAccount() {
    if (!this.poolAccount) {
      throw SarosAMMError.PoolNotInitialized();
    }
    return this.poolAccount;
  }
  /**
   * Stake tokens into the pool
   *
   * @returns Transaction to be signed and sent by the user
   */
  async stake(params) {
    if (!this.poolAccount) {
      throw SarosAMMError.PoolNotInitialized();
    }
    const { payer, amount } = params;
    const transaction = new web3_js.Transaction();
    const [userPoolAddress, userPoolNonce] = deriveFarmUserPoolAddress(
      payer,
      this.poolAddress,
      this.farmProgram.programId
    );
    const userStakingTokenAccount =
      params.userStakingTokenAccount ||
      (await spl2__namespace.getAssociatedTokenAddress(this.poolAccount.stakingTokenMint, payer));
    const userPoolAccountInfo = await this.connection.getAccountInfo(userPoolAddress);
    if (!userPoolAccountInfo) {
      const createUserPoolIx = await this.farmProgram.methods
        .createUserPool(userPoolNonce)
        .accounts({
          user: payer,
          pool: this.poolAddress,
          userPool: userPoolAddress,
          systemProgram: web3_js.SystemProgram.programId,
        })
        .instruction();
      transaction.add(createUserPoolIx);
    }
    const stakeIx = await this.farmProgram.methods
      .stakePool(new anchor.BN(amount.toString()))
      .accounts({
        pool: this.poolAddress,
        poolStakingTokenAccount: this.poolAccount.stakingTokenAccount,
        user: payer,
        userPool: userPoolAddress,
        userStakingTokenAccount,
        tokenProgram: spl2__namespace.TOKEN_PROGRAM_ID,
      })
      .instruction();
    transaction.add(stakeIx);
    if (this.apiInfo?.rewards) {
      for (const reward of this.apiInfo.rewards) {
        const poolRewardAddress = new web3_js.PublicKey(reward.poolRewardAddress);
        const [userPoolRewardAddress, userPoolRewardNonce] = deriveFarmUserPoolRewardAddress(
          payer,
          poolRewardAddress,
          this.farmProgram.programId
        );
        const userPoolRewardInfo = await this.connection.getAccountInfo(userPoolRewardAddress);
        if (!userPoolRewardInfo) {
          const createUserPoolRewardIx = await this.farmProgram.methods
            .createUserPoolReward(userPoolRewardNonce)
            .accounts({
              user: payer,
              poolReward: poolRewardAddress,
              userPoolReward: userPoolRewardAddress,
              systemProgram: web3_js.SystemProgram.programId,
            })
            .instruction();
          transaction.add(createUserPoolRewardIx);
        }
        const stakePoolRewardIx = await this.farmProgram.methods
          .stakePoolReward()
          .accounts({
            pool: this.poolAddress,
            poolReward: poolRewardAddress,
            user: payer,
            userPool: userPoolAddress,
            userPoolReward: userPoolRewardAddress,
          })
          .instruction();
        transaction.add(stakePoolRewardIx);
      }
    }
    return transaction;
  }
  /**
   * Unstake tokens from the pool
   *
   * @returns Transaction to be signed and sent by the user
   */
  async unstake(params) {
    if (!this.poolAccount) {
      throw SarosAMMError.PoolNotInitialized();
    }
    const { payer, amount } = params;
    const transaction = new web3_js.Transaction();
    const [userPoolAddress] = deriveFarmUserPoolAddress(payer, this.poolAddress, this.farmProgram.programId);
    const [poolAuthority] = deriveFarmPoolAuthority(this.poolAddress, this.farmProgram.programId);
    const userStakingTokenAccount =
      params.userStakingTokenAccount ||
      (await spl2__namespace.getAssociatedTokenAddress(this.poolAccount.stakingTokenMint, payer));
    if (this.apiInfo?.rewards) {
      for (const reward of this.apiInfo.rewards) {
        const poolRewardAddress = new web3_js.PublicKey(reward.poolRewardAddress);
        const [userPoolRewardAddress] = deriveFarmUserPoolRewardAddress(
          payer,
          poolRewardAddress,
          this.farmProgram.programId
        );
        const unstakePoolRewardIx = await this.farmProgram.methods
          .unstakePoolReward()
          .accounts({
            pool: this.poolAddress,
            poolReward: poolRewardAddress,
            user: payer,
            userPool: userPoolAddress,
            userPoolReward: userPoolRewardAddress,
          })
          .instruction();
        transaction.add(unstakePoolRewardIx);
      }
    }
    const unstakeIx = await this.farmProgram.methods
      .unstakePool(new anchor.BN(amount.toString()))
      .accounts({
        pool: this.poolAddress,
        poolAuthority,
        poolStakingTokenAccount: this.poolAccount.stakingTokenAccount,
        user: payer,
        userPool: userPoolAddress,
        userStakingTokenAccount,
        tokenProgram: spl2__namespace.TOKEN_PROGRAM_ID,
      })
      .instruction();
    transaction.add(unstakeIx);
    return transaction;
  }
  /**
   * Claim rewards from a specific pool reward
   *
   * @returns Transaction to be signed and sent by the user
   */
  async claimReward(params) {
    const { payer, poolRewardAddress } = params;
    const transaction = new web3_js.Transaction();
    const poolRewardAccount = await this.accounts.poolReward.fetch(poolRewardAddress);
    const [userPoolRewardAddress] = deriveFarmUserPoolRewardAddress(
      payer,
      poolRewardAddress,
      this.farmProgram.programId
    );
    const [poolRewardAuthority] = deriveFarmPoolRewardAuthority(poolRewardAddress, this.farmProgram.programId);
    const userRewardTokenAccount =
      params.userRewardTokenAccount ||
      (await spl2__namespace.getAssociatedTokenAddress(poolRewardAccount.rewardTokenMint, payer));
    const userRewardAccountInfo = await this.connection.getAccountInfo(userRewardTokenAccount);
    if (!userRewardAccountInfo) {
      const createATAIx = spl2__namespace.createAssociatedTokenAccountInstruction(
        payer,
        userRewardTokenAccount,
        payer,
        poolRewardAccount.rewardTokenMint
      );
      transaction.add(createATAIx);
    }
    const claimIx = await this.farmProgram.methods
      .claimReward()
      .accounts({
        poolReward: poolRewardAddress,
        poolRewardAuthority,
        poolRewardTokenAccount: poolRewardAccount.rewardTokenAccount,
        user: payer,
        userPoolReward: userPoolRewardAddress,
        userRewardTokenAccount,
        tokenProgram: spl2__namespace.TOKEN_PROGRAM_ID,
      })
      .instruction();
    transaction.add(claimIx);
    return transaction;
  }
  /**
   * Get user's staking position
   */
  async getUserPosition(user) {
    const [userPoolAddress] = deriveFarmUserPoolAddress(user, this.poolAddress, this.farmProgram.programId);
    const userPoolAccount = await this.accounts.userPool.fetch(userPoolAddress);
    const rewards = [];
    if (this.apiInfo?.rewards) {
      for (const reward of this.apiInfo.rewards) {
        const poolRewardAddress = new web3_js.PublicKey(reward.poolRewardAddress);
        const [userPoolRewardAddress] = deriveFarmUserPoolRewardAddress(
          user,
          poolRewardAddress,
          this.farmProgram.programId
        );
        try {
          const userPoolRewardAccount = await this.accounts.userPoolReward.fetch(userPoolRewardAddress);
          rewards.push({
            poolRewardAddress,
            userPoolRewardAddress,
            rewardTokenMint: new web3_js.PublicKey(reward.rewardTokenMint),
            amount: BigInt(userPoolRewardAccount.amount.toString()),
            rewardDebt: BigInt(userPoolRewardAccount.rewardDebt.toString()),
            rewardPending: BigInt(userPoolRewardAccount.rewardPending.toString()),
          });
        } catch {}
      }
    }
    return {
      userPoolAddress,
      stakedAmount: BigInt(userPoolAccount.amount.toString()),
      totalStaked: BigInt(userPoolAccount.totalStaked.toString()),
      rewards,
    };
  }
};
/*! Bundled license information:

buffer-layout/lib/Layout.js:
  (**
   * Support for translating between Buffer instances and JavaScript
   * native types.
   *
   * {@link module:Layout~Layout|Layout} is the basis of a class
   * hierarchy that associates property names with sequences of encoded
   * bytes.
   *
   * Layouts are supported for these scalar (numeric) types:
   * * {@link module:Layout~UInt|Unsigned integers in little-endian
   *   format} with {@link module:Layout.u8|8-bit}, {@link
   *   module:Layout.u16|16-bit}, {@link module:Layout.u24|24-bit},
   *   {@link module:Layout.u32|32-bit}, {@link
   *   module:Layout.u40|40-bit}, and {@link module:Layout.u48|48-bit}
   *   representation ranges;
   * * {@link module:Layout~UIntBE|Unsigned integers in big-endian
   *   format} with {@link module:Layout.u16be|16-bit}, {@link
   *   module:Layout.u24be|24-bit}, {@link module:Layout.u32be|32-bit},
   *   {@link module:Layout.u40be|40-bit}, and {@link
   *   module:Layout.u48be|48-bit} representation ranges;
   * * {@link module:Layout~Int|Signed integers in little-endian
   *   format} with {@link module:Layout.s8|8-bit}, {@link
   *   module:Layout.s16|16-bit}, {@link module:Layout.s24|24-bit},
   *   {@link module:Layout.s32|32-bit}, {@link
   *   module:Layout.s40|40-bit}, and {@link module:Layout.s48|48-bit}
   *   representation ranges;
   * * {@link module:Layout~IntBE|Signed integers in big-endian format}
   *   with {@link module:Layout.s16be|16-bit}, {@link
   *   module:Layout.s24be|24-bit}, {@link module:Layout.s32be|32-bit},
   *   {@link module:Layout.s40be|40-bit}, and {@link
   *   module:Layout.s48be|48-bit} representation ranges;
   * * 64-bit integral values that decode to an exact (if magnitude is
   *   less than 2^53) or nearby integral Number in {@link
   *   module:Layout.nu64|unsigned little-endian}, {@link
   *   module:Layout.nu64be|unsigned big-endian}, {@link
   *   module:Layout.ns64|signed little-endian}, and {@link
   *   module:Layout.ns64be|unsigned big-endian} encodings;
   * * 32-bit floating point values with {@link
   *   module:Layout.f32|little-endian} and {@link
   *   module:Layout.f32be|big-endian} representations;
   * * 64-bit floating point values with {@link
   *   module:Layout.f64|little-endian} and {@link
   *   module:Layout.f64be|big-endian} representations;
   * * {@link module:Layout.const|Constants} that take no space in the
   *   encoded expression.
   *
   * and for these aggregate types:
   * * {@link module:Layout.seq|Sequence}s of instances of a {@link
   *   module:Layout~Layout|Layout}, with JavaScript representation as
   *   an Array and constant or data-dependent {@link
   *   module:Layout~Sequence#count|length};
   * * {@link module:Layout.struct|Structure}s that aggregate a
   *   heterogeneous sequence of {@link module:Layout~Layout|Layout}
   *   instances, with JavaScript representation as an Object;
   * * {@link module:Layout.union|Union}s that support multiple {@link
   *   module:Layout~VariantLayout|variant layouts} over a fixed
   *   (padded) or variable (not padded) span of bytes, using an
   *   unsigned integer at the start of the data or a separate {@link
   *   module:Layout.unionLayoutDiscriminator|layout element} to
   *   determine which layout to use when interpreting the buffer
   *   contents;
   * * {@link module:Layout.bits|BitStructure}s that contain a sequence
   *   of individual {@link
   *   module:Layout~BitStructure#addField|BitField}s packed into an 8,
   *   16, 24, or 32-bit unsigned integer starting at the least- or
   *   most-significant bit;
   * * {@link module:Layout.cstr|C strings} of varying length;
   * * {@link module:Layout.blob|Blobs} of fixed- or variable-{@link
   *   module:Layout~Blob#length|length} raw data.
   *
   * All {@link module:Layout~Layout|Layout} instances are immutable
   * after construction, to prevent internal state from becoming
   * inconsistent.
   *
   * @local Layout
   * @local ExternalLayout
   * @local GreedyCount
   * @local OffsetLayout
   * @local UInt
   * @local UIntBE
   * @local Int
   * @local IntBE
   * @local NearUInt64
   * @local NearUInt64BE
   * @local NearInt64
   * @local NearInt64BE
   * @local Float
   * @local FloatBE
   * @local Double
   * @local DoubleBE
   * @local Sequence
   * @local Structure
   * @local UnionDiscriminator
   * @local UnionLayoutDiscriminator
   * @local Union
   * @local VariantLayout
   * @local BitStructure
   * @local BitField
   * @local Boolean
   * @local Blob
   * @local CString
   * @local Constant
   * @local bindConstructorLayout
   * @module Layout
   * @license MIT
   * @author Peter A. Bigot
   * @see {@link https://github.com/pabigot/buffer-layout|buffer-layout on GitHub}
   *)
*/

exports.AMM_PROGRAM_IDS = AMM_PROGRAM_IDS;
exports.CURVE_TYPE_MAP = CURVE_TYPE_MAP;
exports.DEFAULT_FEES = DEFAULT_FEES;
exports.DEFAULT_SWAP_CALCULATOR = DEFAULT_SWAP_CALCULATOR;
exports.FARM_IDL = FARM_IDL;
exports.FARM_PROGRAM_IDS = FARM_PROGRAM_IDS;
exports.MODE = MODE;
exports.SAROS_FEE_OWNER = SAROS_FEE_OWNER;
exports.SWAP_ACCOUNT_SIZE = SWAP_ACCOUNT_SIZE;
exports.SarosAMM = SarosAMM;
exports.SarosAMMError = SarosAMMError;
exports.SarosAMMErrorCode = SarosAMMErrorCode;
exports.SarosAMMPair = SarosAMMPair;
exports.SarosAPIService = SarosAPIService;
exports.SarosBaseService = SarosBaseService;
exports.SarosFarm = SarosFarm;
exports.SwapCurveType = SwapCurveType;
exports.calculatePriceImpact = calculatePriceImpact;
exports.calculateSwapOutput = calculateSwapOutput;
exports.deriveFarmPoolAuthority = deriveFarmPoolAuthority;
exports.deriveFarmPoolRewardAuthority = deriveFarmPoolRewardAuthority;
exports.deriveFarmUserPoolAddress = deriveFarmUserPoolAddress;
exports.deriveFarmUserPoolRewardAddress = deriveFarmUserPoolRewardAddress;
exports.derivePoolAuthority = derivePoolAuthority;
exports.getMinOutputWithSlippage = getMinOutputWithSlippage;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map
