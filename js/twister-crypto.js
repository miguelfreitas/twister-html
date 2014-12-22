// Process with:
// browserify twister-crypto.js -o twister-crypto-bundle.js

var Bitcoin = require('bitcoinjs-lib');
var Crypto = require('crypto');
window.Buffer = require('buffer').Buffer;
window.Bencode = require('bencode');

var twister_network = {
    magicPrefix: '\x18twister Signed Message:\n',
    pubKeyHash: 0x00,
}

window.TwisterCrypto = {}

TwisterCrypto.PubKey = Bitcoin.ECPubKey;
TwisterCrypto.PrivKey = Bitcoin.ECKey;

TwisterCrypto.PubKey.prototype.encrypt = function ( message, enc )
{
	var sec = { orig: message.length }
	var ephemeral = Bitcoin.ECKey.makeRandom()
	sec["key"] = enc ? ephemeral.pub.toBuffer().toString(enc) : ephemeral.pub.toBuffer()

	var secret = this.Q.multiply(ephemeral.d).getEncoded().slice(1,33)
	
	var hash_secret = Crypto.createHash('sha512').update(secret).digest()
	var aes_key = hash_secret.slice(0,32)
	var hmac_key = hash_secret.slice(32,64)
	
	var crypter = Crypto.createCipheriv("aes-256-cbc",aes_key.slice(0,32),new Buffer(16))
	var out = []
	out.push(crypter.update(message))
	out.push(crypter.final())
	var sec_body = Buffer.concat(out)
	sec["body"] = enc ? sec_body.toString(enc) : sec_body
	
	hmac=Crypto.createHmac("sha512",hmac_key)
	hmac.update(sec_body)
	sec["mac"] = enc ? hmac.digest().toString(enc) : hmac.digest()

	return sec;
}

TwisterCrypto.PrivKey.prototype.decrypt = function ( sec )
{
	var sec_key = sec["key"];
	var sec_body = sec["body"];
	var sec_mac = sec["mac"];
	var sec_orig = sec["orig"];
	if (!Buffer.isBuffer(sec_key)) {
		sec_key = new Buffer(sec_key, "hex");
	}
	if (!Buffer.isBuffer(sec_body)) {
		sec_body = new Buffer(sec_body, "hex");
	}
	if (!Buffer.isBuffer(sec_mac)) {
		sec_mac = new Buffer(sec_mac, "hex");
	}

	var pubkey = Bitcoin.ECPubKey.fromBuffer(sec_key)
	var secret = pubkey.Q.multiply(this.d).getEncoded().slice(1,33)
	
	var hash_secret = Crypto.createHash('sha512').update(secret).digest()
	var aes_key = hash_secret.slice(0,32)
	var hmac_key = hash_secret.slice(32,64)
	
	var hmac=Crypto.createHmac("sha512",hmac_key)
	hmac.update(sec_body)
	var hmac_val = hmac.digest()
	if( hmac_val.compare(sec_mac) != 0 ) {
		return undefined;
	}
	
	var decrypter = Crypto.createDecipheriv("aes-256-cbc",aes_key.slice(0,32),new Buffer(16))
	var out = []
	out.push(decrypter.update(sec_body))
	out.push(decrypter.final())
	var decrypted = Buffer.concat(out).slice(0,sec_orig)
	
	return decrypted;
}

TwisterCrypto.PrivKey.prototype.messageSign = function ( message, enc )
{
	var signature = Bitcoin.Message.sign(this, message, twister_network);
	return enc ? signature.toString(enc) : signature;
}

TwisterCrypto.PubKey.prototype.messageVerify = function ( message, signature )
{
	if (!Buffer.isBuffer(signature)) {
		signature = new Buffer(signature, 'hex')
	}
	return Bitcoin.Message.verify(this.getAddress(), signature, message, twister_network)
}
