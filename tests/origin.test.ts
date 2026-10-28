import {it,expect} from 'vitest';
import {publicOrigin,canonicalRedirect} from '../worker/origin';
it('keeps staging and production canonical origins separate',()=>{for(const origin of ['https://roast.cursiv.us','https://reporoast-staging.joshua-1993-winkler.workers.dev'])expect(publicOrigin(origin)).toBe(origin);});
it.each(['https://user:password@roast.cursiv.us','https://roast.cursiv.us/?next=x','https://roast.cursiv.us/path','javascript:alert(1)','http://roast.cursiv.us'])('rejects unsafe public origin %s',origin=>expect(()=>publicOrigin(origin)).toThrow());
it('redirects only to configured origin preserving path and query',()=>{expect(canonicalRedirect('http://roast.cursiv.us/s/abc?x=1','https://roast.cursiv.us',true)).toBe('https://roast.cursiv.us/s/abc?x=1');expect(canonicalRedirect('https://staging.example/s/abc','https://roast.cursiv.us',false)).toBeNull();});
